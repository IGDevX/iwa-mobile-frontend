/**
 * Payment Service Configuration
 * 
 * Centralized configuration for payment service endpoints
 */

// Use the API gateway base so frontend talks to gateway which routes to payment service
import { API_GATEWAY_BASE_URL } from '../../constants/Config';

/**
 * Payment Service Endpoints
 */
export const PAYMENT_ENDPOINTS = {
  // Create payment intent (gateway path: /payment/**)
  CREATE_PAYMENT_INTENT: `/stripe-payments/create-intent`,
  
  // Get payment intent status
  GET_PAYMENT_INTENT: (paymentIntentId: string) => 
    `/stripe-payments/${paymentIntentId}`,
  
  // Cancel payment intent
  CANCEL_PAYMENT_INTENT: (paymentIntentId: string) => 
    `/stripe-payments/${paymentIntentId}`,
  
  // Health check
  HEALTH: `/stripe-payments/health`,
} as const;

/**
 * Payment Service Configuration
 */
export const PAYMENT_CONFIG = {
  // Timeout for payment requests (30 seconds)
  TIMEOUT: 30000,
  
  // Maximum retry attempts for failed requests
  MAX_RETRIES: 2,
  
  // Default currency (EUR for European market)
  DEFAULT_CURRENCY: 'eur',
  
  // Platform fee percentage (10% by default)
  PLATFORM_FEE_PERCENTAGE: 10,
} as const;
