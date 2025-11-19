/**
 * Payment API Types
 * 
 * Type definitions for payment service requests and responses
 */

/**
 * Request to create a payment intent
 */
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string; // Currency code (e.g., 'eur', 'usd')
  producerKeycloakId?: string; // Producer's Keycloak ID for connected account
  orderId?: string; // Order ID for tracking
  applicationFeeAmount?: number; // Platform fee amount in cents
  metadata?: Record<string, string>; // Optional metadata for tracking
}

/**
 * Response from creating a payment intent
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string; // Stripe client secret
  paymentIntentId: string; // Payment intent ID
  status: string; // Payment status
}

/**
 * Error response from backend
 */
export interface ErrorResponse {
  code: string; // Error code (e.g., 'INVALID_AMOUNT', 'STRIPE_ERROR')
  message: string; // Error message
}

/**
 * API Error from payment service
 */
export class PaymentApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentApiError';
  }
}
