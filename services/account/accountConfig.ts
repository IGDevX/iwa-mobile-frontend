/**
 * Account Service Configuration
 * 
 * Configuration specific to the Account microservice including
 * endpoints, retry settings, and other service-specific constants.
 */

// Account Service endpoints
export const ACCOUNT_ENDPOINTS = {
  // Personal account endpoints
  ME: '/api/v1/account/me',
  UPDATE_ME: '/api/v1/account/me',
  
  // Producer endpoints (simplified - no {id} parameter for authenticated operations)
  CREATE_PRODUCER: '/api/v1/account/producer',
  GET_PRODUCER: (id: string) => `/api/v1/account/producer/${id}`, // Public profile by user ID
  UPDATE_PRODUCER: '/api/v1/account/producer', // Uses X-Keycloak-Id header
  DELETE_PRODUCER: '/api/v1/account/producer', // Uses X-Keycloak-Id header
  
  // Producer professions management (NEW - CRUD operations)
  ADD_PRODUCER_PROFESSION: (professionId: number) => `/api/v1/account/producer/professions/${professionId}`,
  REMOVE_PRODUCER_PROFESSION: (professionId: number) => `/api/v1/account/producer/professions/${professionId}`,
  
  // Restaurant endpoints (simplified - no {id} parameter for authenticated operations)
  CREATE_RESTAURANT: '/api/v1/account/restaurant',
  GET_RESTAURANT: (id: string) => `/api/v1/account/restaurant/${id}`, // Public profile by user ID
  UPDATE_RESTAURANT: '/api/v1/account/restaurant', // Uses X-Keycloak-Id header
  DELETE_RESTAURANT: '/api/v1/account/restaurant', // Uses X-Keycloak-Id header
  
  // Public profile endpoints
  GET_USER_RESTAURANT: (id: string) => `/api/v1/account/users/${id}/restaurant`,
  GET_USER_PRODUCER: (id: string) => `/api/v1/account/users/${id}/producer`,
  
  // Internal endpoints (service-to-service communication)
  // GET endpoint to retrieve or auto-create user by Keycloak ID
  INTERNAL_BY_KEYCLOAK_ID: (keycloakId: string) => `/api/v1/internal/${keycloakId}`,
  
  // Professions master data
  GET_PROFESSIONS: '/api/v1/account/professions',
  GET_PROFESSION_BY_ID: (id: string) => `/api/v1/account/professions/${id}`,
} as const;

// AsyncStorage keys for account service
export const ACCOUNT_STORAGE_KEYS = {
  PENDING_NOTIFICATIONS: '@pending_account_notifications',
} as const;

// Legacy endpoints (to be removed after migration)
export const ACCOUNT_LEGACY_ENDPOINTS = {
  KEYCLOAK_NOTIFICATION: '/api/users/keycloak-notification',
} as const;
