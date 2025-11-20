/**
 * Payment Service Configuration
 * 
 * Centralized configuration for payment service endpoints
 */

// Base URL for payment service - should be set in environment variables
const PAYMENT_BASE_URL = process.env.EXPO_PUBLIC_PAYMENT_URL || 'http://localhost:5000';

/**
 * Payment Service Endpoints
 */
export const PAYMENT_ENDPOINTS = {
  // Create payment intent
  CREATE_PAYMENT_INTENT: `${PAYMENT_BASE_URL}/api/payments/create-intent`,
  
  // Get payment intent status
  GET_PAYMENT_INTENT: (paymentIntentId: string) => 
    `${PAYMENT_BASE_URL}/api/payments/${paymentIntentId}`,
  
  // Cancel payment intent
  CANCEL_PAYMENT_INTENT: (paymentIntentId: string) => 
    `${PAYMENT_BASE_URL}/api/payments/${paymentIntentId}`,
  
  // Health check
  HEALTH: `${PAYMENT_BASE_URL}/api/payments/health`,
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
