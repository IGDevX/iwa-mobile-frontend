/**
 * Global Configuration
 * 
 * Shared configuration for all microservices including
 * base URLs, timeouts, and retry settings.
 */

// API Gateway base URL (Architecture centralisée)
// Tous les services sont accessibles via la Gateway
export const API_GATEWAY_BASE_URL = process.env.EXPO_PUBLIC_URL_GATEWAY_DEV || 'http://localhost:8080';


// Request timeout in milliseconds
export const API_TIMEOUT = 10000;

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
