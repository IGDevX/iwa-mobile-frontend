/**
 * Payment Service
 * 
 * API service for interacting with the payment backend service.
 * Handles payment intent creation, retrieval, and cancellation.
 */

import { httpDelete, httpGet, httpPost } from '../shared/httpClient';
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
 * 
 * @param request - Payment intent request data
 * @returns Payment intent response with client secret
 * @throws PaymentApiError if the request fails
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await httpPost<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.CREATE_PAYMENT_INTENT,
      request,
      {
        timeout: PAYMENT_CONFIG.TIMEOUT,
      }
    );

    return response;
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
 * 
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent details
 * @throws PaymentApiError if the request fails
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await httpGet<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.GET_PAYMENT_INTENT(paymentIntentId),
      {
        timeout: PAYMENT_CONFIG.TIMEOUT,
      }
    );

    return response;
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
 * 
 * @param paymentIntentId - Payment intent ID to cancel
 * @returns Cancelled payment intent
 * @throws PaymentApiError if the request fails
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await httpDelete<CreatePaymentIntentResponse>(
      PAYMENT_ENDPOINTS.CANCEL_PAYMENT_INTENT(paymentIntentId),
      {
        timeout: PAYMENT_CONFIG.TIMEOUT,
      }
    );

    return response;
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
 * 
 * @returns Health status message
 * @throws PaymentApiError if the request fails
 */
export async function checkPaymentServiceHealth(): Promise<string> {
  try {
    const response = await httpGet<string>(
      PAYMENT_ENDPOINTS.HEALTH,
      {
        timeout: PAYMENT_CONFIG.TIMEOUT,
      }
    );

    return response;
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

