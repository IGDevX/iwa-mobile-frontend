/**
 * Payment Service
 * 
 * API service for interacting with the payment backend service.
 * Handles payment intent creation, retrieval, and cancellation.
 */

import { paymentGet, paymentPost, paymentDelete } from './paymentHttpClient';
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from './paymentApi';
import { PaymentApiError } from './paymentApi';
import { PAYMENT_CONFIG, PAYMENT_ENDPOINTS } from './paymentConfig';

// ============================================
// Payment Intent Functions
// ============================================

/**
 * Create a payment intent for processing payment
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {
    return await paymentPost<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.CREATE_PAYMENT_INTENT,
      request
    );
  } catch (error: any) {
    console.error('[createPaymentIntent] Failed:', error);
    throw new PaymentApiError(
      error.message || 'Failed to create payment intent',
      error.statusCode,
      error
    );
  }
}

/**
 * Get payment intent by ID
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<CreatePaymentIntentResponse> {
  try {
    return await paymentGet<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.GET_PAYMENT_INTENT(paymentIntentId)
    );
  } catch (error: any) {
    console.error('[getPaymentIntent] Failed:', error);
    throw new PaymentApiError(
      error.message || 'Failed to get payment intent',
      error.statusCode,
      error
    );
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<CreatePaymentIntentResponse> {
  try {
    return await paymentDelete<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.CANCEL_PAYMENT_INTENT(paymentIntentId)
    );
  } catch (error: any) {
    console.error('[cancelPaymentIntent] Failed:', error);
    throw new PaymentApiError(
      error.message || 'Failed to cancel payment intent',
      error.statusCode,
      error
    );
  }
}

/**
 * Check payment service health
 */
export async function checkPaymentServiceHealth(): Promise<string> {
  try {
    return await paymentGet<string>(PAYMENT_ENDPOINTS.HEALTH);
  } catch (error: any) {
    console.error('[checkPaymentServiceHealth] Failed:', error);
    throw new PaymentApiError(
      error.message || 'Failed to check payment service health',
      error.statusCode,
      error
    );
  }
}

// ============================================
// Export all functions
// ============================================

export {
  PaymentApiError,
  type CreatePaymentIntentRequest,
  type CreatePaymentIntentResponse
};
