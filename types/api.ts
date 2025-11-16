/**
 * API Type Definitions
 * 
 * TypeScript interfaces for API requests and responses
 */

// ============================================
// Account Service Types (API v1)
// ============================================

/**
 * Restaurant Profile Request
 */
export interface RestaurantProfileRequest {
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  serviceType?: string;
  cuisineType?: string;
  hygieneCertifications?: string;
  awards?: string;
}

/**
 * Producer Profile Request
 */
export interface ProducerProfileRequest {
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  siret?: string;
  organizationType?: string;
  installationYear?: number;
  employeesCount?: number;
  profession?: string;
}

/**
 * Update Personal Info Request
 */
export interface UpdatePersonalInfoRequest {
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

/**
 * User Profile Response (Full profile)
 */
export interface UserProfileResponse {
  id: number;
  keycloakId: string;
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  siret?: string;
  organizationType?: string;
  installationYear?: number;
  employeesCount?: number;
  profession?: string;
  serviceType?: string;
  cuisineType?: string;
  hygieneCertifications?: string;
  awards?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Restaurant Public Profile Response
 */
export interface RestaurantPublicProfileResponse {
  id: number;
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  serviceType?: string;
  cuisineType?: string;
  hygieneCertifications?: string;
  awards?: string;
}

/**
 * Producer Public Profile Response
 */
export interface ProducerPublicProfileResponse {
  id: number;
  biography?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  siret?: string;
  organizationType?: string;
  installationYear?: number;
  employeesCount?: number;
  profession?: string;
}

/**
 * Keycloak Notification Request (Internal API)
 */
export interface KeycloakNotificationRequest {
  keycloakId: string;
}

// ============================================
// Legacy Types (pour compatibilité)
// ============================================

/**
 * Request payload for notifying account service after Keycloak registration
 * @deprecated Use ProducerProfileRequest or RestaurantProfileRequest instead
 */
export interface NotifyAccountServiceRequest {
  keycloakId: string;
  email?: string;
  username?: string;
  role?: string;
  fullName?: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Response from account service after creating/retrieving user
 * @deprecated Use UserProfileResponse instead
 */
export interface NotifyAccountServiceResponse {
  id: string; // Internal account service ID
  keycloakId: string;
  clientId?: string; // Generated client ID for the user
  email?: string;
  username?: string;
  role?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User information from account service
 */
export interface AccountUser {
  id: string;
  keycloakId: string;
  clientId?: string;
  email?: string;
  username?: string;
  role?: string;
  fullName?: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  profileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// HTTP Client Types
// ============================================

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  response?: ApiErrorResponse;

  constructor(message: string, statusCode: number, response?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

// ============================================
// Offline Queue Types
// ============================================

/**
 * Pending notification to be sent to account service
 */
export interface PendingNotification {
  id: string; // Unique ID for the pending notification
  keycloakId: string;
  payload: NotifyAccountServiceRequest;
  timestamp: number; // When it was queued
  attempts: number; // Number of retry attempts
  lastError?: string;
}
