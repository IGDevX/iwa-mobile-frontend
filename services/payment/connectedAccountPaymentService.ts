/**
 * Stripe Connect Payment Integration
 * 
 * Utilities for integrating Stripe Connect accounts with payment processing
 */

import { createPaymentIntent, CreatePaymentIntentRequest } from './paymentService';
import { ConnectedAccountStatusResponse, getConnectedAccount } from './stripeConnectService';

/**
 * Enhanced payment intent request that can handle connected accounts
 */
export interface ConnectedAccountPaymentIntentRequest extends CreatePaymentIntentRequest {
  /**
   * Application fee amount in cents to charge the connected account
   * This is the platform fee for facilitating the transaction
   */
  applicationFeeAmount?: number;
  
  /**
   * Whether to transfer funds immediately to the connected account
   * Default: false (funds held in platform account until transfer)
   */
  transferFunds?: boolean;
  
  /**
   * Connected account ID (if known)
   * If not provided, will be fetched from current user's account
   */
  connectedAccountId?: string;
  
  /**
   * Producer's Keycloak ID - required for connected account payments
   */
  producerKeycloakId: string;
  
  /**
   * Order ID for tracking
   */
  orderId: string;
}

/**
 * Enhanced payment intent response with connected account information
 */
export interface ConnectedAccountPaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  connectedAccountId?: string;
  applicationFeeAmount?: number;
  transferAmount?: number;
  producerKeycloakId: string;
  orderId: string;
}

/**
 * Create a payment intent with connected account support
 * This handles platform payments where funds flow through connected accounts
 * 
 * @param request Payment intent request with connected account options
 * @returns Payment intent with connected account details
 */
export async function createConnectedAccountPaymentIntent(
  request: ConnectedAccountPaymentIntentRequest
): Promise<ConnectedAccountPaymentIntentResponse> {
  const {
    applicationFeeAmount = 0,
    transferFunds = false,
    connectedAccountId: providedAccountId,
    producerKeycloakId,
    orderId,
    ...paymentRequest
  } = request;

  // Validate required fields
  if (!producerKeycloakId) {
    throw new Error('Producer Keycloak ID is required for connected account payments');
  }
  
  if (!orderId) {
    throw new Error('Order ID is required for connected account payments');
  }

  // Get connected account ID if not provided
  let connectedAccountId = providedAccountId;
  if (!connectedAccountId) {
    const account = await getConnectedAccount();
    if (!account || !account.onboardingComplete) {
      throw new Error('Connected account not found or setup incomplete');
    }
    connectedAccountId = account.stripeAccountId;
  }

  // Calculate transfer amount (total - application fee)
  const transferAmount = transferFunds 
    ? paymentRequest.amount - applicationFeeAmount
    : 0;

  // Create enhanced payment intent request with new required fields
  const enhancedRequest = {
    ...paymentRequest,
    producerKeycloakId,
    orderId,
    applicationFeeAmount,
    metadata: {
      ...paymentRequest.metadata,
      connectedAccountId: connectedAccountId || '',
      applicationFeeAmount: applicationFeeAmount.toString(),
      transferAmount: transferAmount.toString(),
      transferFunds: transferFunds.toString(),
      producerKeycloakId,
      orderId,
    },
  };

  // Create the payment intent
  const response = await createPaymentIntent(enhancedRequest);

  return {
    clientSecret: response.clientSecret,
    paymentIntentId: response.paymentIntentId,
    connectedAccountId,
    applicationFeeAmount,
    transferAmount,
    producerKeycloakId,
    orderId,
  };
}

/**
 * Check if current user has a ready connected account for payments
 * 
 * @returns True if user can receive payments through connected account
 */
export async function canReceivePayments(): Promise<boolean> {
  try {
    const account = await getConnectedAccount();
    return account?.onboardingComplete === true && 
           account?.accountStatus === 'active';
  } catch (error) {
    console.warn('Error checking payment capability:', error);
    return false;
  }
}

/**
 * Check if a specific producer can receive payments
 * 
 * @param producerKeycloakId Producer's Keycloak ID
 * @returns Promise resolving to payment capability status
 */
export async function canProducerReceivePayments(producerKeycloakId: string): Promise<{
  canReceive: boolean;
  account: ConnectedAccountStatusResponse | null;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    if (!producerKeycloakId) {
      errors.push('Producer ID is required');
      return { canReceive: false, account: null, errors };
    }
    
    // Note: In a real implementation, you'd fetch the producer's specific account
    // For now, we'll check the current user's account as an example
    const account = await getConnectedAccount();
    
    if (!account) {
      errors.push('Producer has not set up payment account');
      return { canReceive: false, account: null, errors };
    }
    
    if (!account.onboardingComplete) {
      errors.push('Producer payment setup is incomplete');
    }
    
    if (account.accountStatus !== 'active') {
      errors.push('Producer account is not active');
    }
    
    const canReceive = account.onboardingComplete && account.accountStatus === 'active';
    
    return {
      canReceive,
      account,
      errors
    };
    
  } catch (error) {
    console.error('Error checking producer payment capability:', error);
    errors.push('Unable to verify producer payment capability');
    return { canReceive: false, account: null, errors };
  }
}

/**
 * Validate producer account before creating payment intent
 * 
 * @param producerKeycloakId Producer's Keycloak ID
 * @throws Error if producer cannot receive payments
 */
export async function validateProducerAccount(producerKeycloakId: string): Promise<ConnectedAccountStatusResponse> {
  const { canReceive, account, errors } = await canProducerReceivePayments(producerKeycloakId);
  
  if (!canReceive) {
    throw new Error(`Producer payment account issues: ${errors.join(', ')}`);
  }
  
  return account!;
}

/**
 * Get connected account payment capability status
 * 
 * @returns Detailed payment capability information
 */
export async function getPaymentCapabilityStatus(): Promise<{
  canReceivePayments: boolean;
  canReceivePayouts: boolean;
  account: ConnectedAccountStatusResponse | null;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    const account = await getConnectedAccount();
    
    if (!account) {
      issues.push('No payment account found');
      return {
        canReceivePayments: false,
        canReceivePayouts: false,
        account: null,
        issues,
      };
    }

    if (!account.onboardingComplete) {
      issues.push('Payment account setup incomplete');
    }

    if (account.accountStatus !== 'active') {
      issues.push(`Account status is ${account.accountStatus}`);
    }

    const isActive = account.onboardingComplete && account.accountStatus === 'active';

    return {
      canReceivePayments: isActive,
      canReceivePayouts: isActive,
      account,
      issues,
    };
  } catch (error) {
    issues.push('Error checking account status');
    return {
      canReceivePayments: false,
      canReceivePayouts: false,
      account: null,
      issues,
    };
  }
}

/**
 * Calculate platform fee for a payment amount
 * This is a utility function to calculate fees consistently across the app
 * 
 * @param amount Payment amount in cents
 * @param feePercentage Platform fee percentage (default: 2.9%)
 * @param fixedFee Fixed fee in cents (default: 30 cents)
 * @returns Platform fee amount in cents
 */
export function calculatePlatformFee(
  amount: number,
  feePercentage: number = 2.9,
  fixedFee: number = 30
): number {
  const percentageFee = Math.round(amount * (feePercentage / 100));
  return percentageFee + fixedFee;
}

/**
 * Calculate net amount after platform fee
 * 
 * @param amount Payment amount in cents
 * @param feePercentage Platform fee percentage (default: 2.9%)
 * @param fixedFee Fixed fee in cents (default: 30 cents)
 * @returns Net amount that the connected account will receive
 */
export function calculateNetAmount(
  amount: number,
  feePercentage: number = 2.9,
  fixedFee: number = 30
): number {
  const platformFee = calculatePlatformFee(amount, feePercentage, fixedFee);
  return amount - platformFee;
}