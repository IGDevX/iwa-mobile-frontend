/**
 * Stripe Connect Service
 * 
 * Service for managing Stripe connected accounts for producers/merchants
 * Enables them to receive payments through the platform
 */

import { httpDelete, httpGet, httpPost } from '../shared/httpClient';

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
 * Base URL for account service endpoints
 */
const ACCOUNT_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001';

/**
 * Stripe Connect API endpoints
 */
export const STRIPE_CONNECT_ENDPOINTS = {
  CREATE_CONNECTED_ACCOUNT: `${ACCOUNT_BASE_URL}/api/v1/account/stripe/connected-account`,
  GET_CONNECTED_ACCOUNT: `${ACCOUNT_BASE_URL}/api/v1/account/stripe/connected-account`,
  REFRESH_ONBOARDING: `${ACCOUNT_BASE_URL}/api/v1/account/stripe/refresh-onboarding`,
  SYNC_ACCOUNT_STATUS: `${ACCOUNT_BASE_URL}/api/v1/account/stripe/sync-status`,
  DELETE_CONNECTED_ACCOUNT: `${ACCOUNT_BASE_URL}/api/v1/account/stripe/connected-account`,
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

    const response = await httpPost<ConnectedAccountCreateResponse>(
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
    const response = await httpGet<ConnectedAccountStatusResponse>(
      STRIPE_CONNECT_ENDPOINTS.GET_CONNECTED_ACCOUNT
    );
    
    return response;
  } catch (error) {
    // Return null if no account exists (400/404 status)
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as any).statusCode;
      
      if (statusCode === 400 || statusCode === 404) {
        return null;
      }
    }

    if (error instanceof Error) {
      throw new StripeConnectError(
        `Failed to get connected account: ${error.message}`,
        'statusCode' in error ? (error as any).statusCode : undefined
      );
    }
    throw new StripeConnectError('Failed to get connected account');
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

    const response = await httpPost<OnboardingRefreshResponse>(
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
    const response = await httpPost<AccountSyncResponse>(
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
    await httpDelete<void>(STRIPE_CONNECT_ENDPOINTS.DELETE_CONNECTED_ACCOUNT);
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