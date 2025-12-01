/**
 * Stripe Connect Service
 * 
 * Service for managing Stripe connected accounts for producers/merchants
 * Enables them to receive payments through the platform
 */

import { stripeDelete, stripeGet, stripePost } from './paymentHttpClient';

/**
 * Types for Stripe Connect API requests and responses
 * Matching your exact backend API specification
 */

export interface ConnectedAccountCreateRequest {
  country?: string;
  businessType?: string;
}

export interface ConnectedAccountCreateResponse {
  accountId: string;
  onboardingUrl: string;
  expiresAt: string;
}

export interface ConnectedAccountStatusResponse {
  stripeAccountId: string;
  accountStatus: 'incomplete' | 'pending' | 'active' | 'rejected';
  onboardingComplete: boolean;
  dashboardUrl?: string;
  onboardingUrl?: string | null;
}

export interface OnboardingRefreshRequest {
  returnUrl: string;
  refreshUrl: string;
}

export interface OnboardingRefreshResponse {
  onboardingUrl: string;
  expiresAt: string;
}

export interface AccountSyncResponse {
  stripeAccountId: string;
  accountStatus: 'incomplete' | 'pending' | 'active' | 'rejected';
  onboardingComplete: boolean;
}

/**
 * Error class for Stripe Connect operations
 */
export class StripeConnectError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'StripeConnectError';
  }
}

/**
 * Stripe Connect API endpoints (relative paths)
 * These will be appended to the base URL configured in paymentHttpClient
 */
export const STRIPE_CONNECT_ENDPOINTS = {
  CREATE_CONNECTED_ACCOUNT: '/connected-account',
  GET_CONNECTED_ACCOUNT: '/connected-account',
  REFRESH_ONBOARDING: '/refresh-onboarding',
  SYNC_ACCOUNT_STATUS: '/sync-status',
  DELETE_CONNECTED_ACCOUNT: '/connected-account',
} as const;

/**
 * Create a new Stripe connected account
 * 
 * @param returnUrl URL to redirect to after onboarding completion (not used in request, handled by backend)
 * @param refreshUrl URL to redirect to when onboarding link expires (not used in request, handled by backend)
 * @returns Connected account information with onboarding URL
 */
export async function createConnectedAccount(
  returnUrl: string,
  refreshUrl: string
): Promise<ConnectedAccountCreateResponse> {
  try {
    // Backend expects country and businessType (both optional, defaults to FR and individual)
    const requestBody: ConnectedAccountCreateRequest = {
      country: 'FR',
      businessType: 'individual'
    };

    const response = await stripePost<ConnectedAccountCreateResponse>(
      STRIPE_CONNECT_ENDPOINTS.CREATE_CONNECTED_ACCOUNT,
      requestBody
    );

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new StripeConnectError(
        `Failed to create connected account: ${error.message}`,
        'statusCode' in error ? (error as any).statusCode : undefined
      );
    }
    throw new StripeConnectError('Failed to create connected account');
  }
}

/**
 * Get connected account information for the current user
 * 
 * @returns Connected account information or null if not found
 */
export async function getConnectedAccount(): Promise<ConnectedAccountStatusResponse | null> {
  try {
    const response = await stripeGet<ConnectedAccountStatusResponse>(
      STRIPE_CONNECT_ENDPOINTS.GET_CONNECTED_ACCOUNT
    );

    return response;
  } catch (error) {
    console.log('DEBUG: Raw error from getConnectedAccount():', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Extract status code from message: "HTTP 404: {..}"
    const match = errorMessage.match(/HTTP\s+(\d{3})/);
    const statusCode = match ? Number(match[1]) : undefined;

    if (statusCode === 400 || statusCode === 404) {
      console.warn(
        `[StripeConnect] No connected account found (${statusCode}). Raw:`,
        errorMessage
      );
      return null;
    }

    console.error('Failed to get connected account:', error);

    throw new StripeConnectError(
      `Failed to get connected account: ${errorMessage}`,
      statusCode
    );
  }
}

/**
 * Refresh onboarding link for incomplete accounts
 * 
 * @param returnUrl URL to redirect to after onboarding completion
 * @param refreshUrl URL to redirect to when onboarding link expires
 * @returns New onboarding URL
 */
export async function refreshOnboardingLink(
  returnUrl: string,
  refreshUrl: string
): Promise<OnboardingRefreshResponse> {
  try {
    const requestBody = {
      returnUrl,
      refreshUrl,
    };

    const response = await stripePost<OnboardingRefreshResponse>(
      STRIPE_CONNECT_ENDPOINTS.REFRESH_ONBOARDING,
      requestBody
    );

    return response;
  } catch (error) {
    console.error('Failed to refresh onboarding link:', error);
    if (error instanceof Error) {
      throw new StripeConnectError(
        `Failed to refresh onboarding link: ${error.message}`,
        'statusCode' in error ? (error as any).statusCode : undefined
      );
    }
    throw new StripeConnectError('Failed to refresh onboarding link');
  }
}

/**
 * Sync account status from Stripe
 * Forces a refresh of account data from Stripe's API
 * 
 * @returns Updated account status
 */
export async function syncAccountStatus(): Promise<AccountSyncResponse> {
  try {
    const response = await stripePost<AccountSyncResponse>(
      STRIPE_CONNECT_ENDPOINTS.SYNC_ACCOUNT_STATUS
    );

    return response;
  } catch (error) {
    console.error('Failed to sync account status:', error);
    if (error instanceof Error) {
      throw new StripeConnectError(
        `Failed to sync account status: ${error.message}`,
        'statusCode' in error ? (error as any).statusCode : undefined
      );
    }
    throw new StripeConnectError('Failed to sync account status');
  }
}

/**
 * Delete connected account
 * WARNING: This action cannot be undone
 */
export async function deleteConnectedAccount(): Promise<void> {
  try {
    await stripeDelete<void>(STRIPE_CONNECT_ENDPOINTS.DELETE_CONNECTED_ACCOUNT);
  } catch (error) {
    console.error('Failed to delete connected account:', error);
    if (error instanceof Error) {
      throw new StripeConnectError(
        `Failed to delete connected account: ${error.message}`,
        'statusCode' in error ? (error as any).statusCode : undefined
      );
    }
    throw new StripeConnectError('Failed to delete connected account');
  }
}

/**
 * Check if account setup is complete and ready to receive payments
 * 
 * @param account Connected account data
 * @returns True if account can receive payments
 */
export function isAccountReadyForPayments(account: ConnectedAccountStatusResponse | null): boolean {
  return account?.onboardingComplete === true &&
    account?.accountStatus === 'active';
}/**
 * Get account status display message
 * 
 * @param account Connected account data
 * @returns Human-readable status message
 */
export function getAccountStatusMessage(account: ConnectedAccountStatusResponse | null): string {
  if (!account) {
    return 'No payment account set up';
  }

  switch (account.accountStatus) {
    case 'incomplete':
      return 'Payment account setup incomplete';
    case 'pending':
      return 'Payment account pending verification';
    case 'active':
      return 'Payment account active';
    case 'rejected':
      return 'Payment account rejected';
    default:
      return 'Payment account status unknown';
  }
}