/**
 * Global Configuration
 * 
 * Shared configuration for all microservices including
 * base URLs, timeouts, and retry settings.
 */

// Backend API base URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001';

// Request timeout in milliseconds
export const API_TIMEOUT = 10000;

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
