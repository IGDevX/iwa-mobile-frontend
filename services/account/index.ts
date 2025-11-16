/**
 * Account Service Module
 * 
 * Main entry point for the Account microservice.
 * Re-exports all public APIs, types, and configuration.
 */

// Export all service functions
export * from './accountService';

// Export all types
export * from './accountApi';

// Export configuration (if needed externally)
export { ACCOUNT_ENDPOINTS, ACCOUNT_STORAGE_KEYS } from './accountConfig';
