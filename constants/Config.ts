/**
 * Global Configuration
 * 
 * Shared configuration for all microservices including
 * base URLs, timeouts, and retry settings.
 */

// Account Service base URL
export const ACCOUNT_SERVICE_BASE_URL = process.env.EXPO_PUBLIC_ACCOUNT_SERVICE_URL || 'http://localhost:5001';

// Request timeout in milliseconds
export const API_TIMEOUT = 10000;

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
