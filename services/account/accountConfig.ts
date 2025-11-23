/**
 * Account Service Configuration
 *
 * Configuration pour l'accès au Account Service via l'API Gateway
 * Architecture centralisée : Toutes les requêtes passent par localhost:8080/account
 */

import { API_GATEWAY_BASE_URL } from '../../constants/Config';

// Préfixe pour le Account Service dans la Gateway
const ACCOUNT_PREFIX = '/account';

/**
 * Account Service API Endpoints via Gateway
 *
 * IMPORTANT - Règles de Sécurité :
 *
 * ENDPOINTS PUBLICS (pas de token requis) :
 * - GET /account/professions/** (référentiel public)
 * - GET /account/restaurant/** (profils publics des restaurants)
 * - GET /account/producer/** (profils publics des producteurs)
 * - GET /account/user/username/** (profils publics des utilisateurs)
 *
 * ENDPOINTS PRIVÉS (token JWT requis) :
 * - PUT /account/user (modification profil personnel)
 * - DELETE /account/user/{id} (suppression compte)
 * - POST/PUT/DELETE /account/restaurant (gestion restaurant)
 * - POST/PUT/DELETE /account/producer (gestion producteur)
 * - POST/PUT/DELETE /account/address (gestion adresses)
 */
export const ACCOUNT_ENDPOINTS = {
  // ============================================
  // User Management
  // ============================================

  // Profil utilisateur (PUBLIC pour consultation, PRIVATE pour modification)
  GET_USER_BY_KEYCLOAK_ID: (keycloakId: string) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user/keycloak/${keycloakId}`, // PRIVATE
  GET_USER_BY_USERNAME: (username: string) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user/username/${username}`, // PUBLIC
  UPDATE_USER: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user`, // PUT PRIVATE
  DELETE_USER: (userId: number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user/${userId}`, // DELETE PRIVATE

  // ============================================
  // Professions (Référentiel)
  // ============================================
  GET_ALL_PROFESSIONS: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/professions`, // GET PUBLIC

  // ============================================
  // Restaurant Management
  // ============================================
  GET_RESTAURANT_BY_ID: (restaurantId: number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant/${restaurantId}`, // GET PUBLIC
  GET_ALL_RESTAURANTS: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant`, // GET PUBLIC
  CREATE_RESTAURANT: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant`, // POST PRIVATE
  UPDATE_RESTAURANT: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant`, // PUT PRIVATE
  DELETE_RESTAURANT: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant`, // DELETE PRIVATE (utilise X-Keycloak-Id)

  // ============================================
  // Producer Management
  // ============================================
  GET_PRODUCER_BY_ID: (producerId: number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer/${producerId}`, // GET PUBLIC
  GET_ALL_PRODUCERS: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer`, // GET PUBLIC
  CREATE_PRODUCER: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer`, // POST PRIVATE
  UPDATE_PRODUCER: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer`, // PUT PRIVATE
  DELETE_PRODUCER: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer`, // DELETE PRIVATE (utilise X-Keycloak-Id)

  // ============================================
  // Address Management
  // ============================================
  GET_USER_ADDRESSES: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/address`, // GET PRIVATE
  CREATE_ADDRESS: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/address`, // POST PRIVATE
  UPDATE_ADDRESS: (addressId: number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/address/${addressId}`, // PUT PRIVATE
  DELETE_ADDRESS: (addressId: number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/address/${addressId}`, // DELETE PRIVATE

  // ============================================
  // Legacy/Alternative Endpoints (for backward compatibility)
  // ============================================
  ME: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user`, // GET PRIVATE (alias for current user)
  UPDATE_ME: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user`, // PUT PRIVATE
  GET_PROFESSIONS: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/professions`, // GET PUBLIC
  GET_PROFESSION_BY_ID: (id: string) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/professions/${id}`, // GET PUBLIC
  GET_PRODUCER: (id: string | number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer/${id}`, // GET PUBLIC
  GET_RESTAURANT: (id: string | number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/restaurant/${id}`, // GET PUBLIC

  // Producer Professions Management
  ADD_PRODUCER_PROFESSION: (professionId: string | number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer/professions/${professionId}`, // POST PRIVATE
  REMOVE_PRODUCER_PROFESSION: (professionId: string | number) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/producer/professions/${professionId}`, // DELETE PRIVATE

  // Internal endpoint (remplacé par ME qui utilise X-Keycloak-Id header)
  // Note: Ne pas utiliser directement, utiliser getUserByKeycloakId() qui gère le header
  INTERNAL_BY_KEYCLOAK_ID: (keycloakId: string) =>
    `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/me`, // GET PRIVATE avec X-Keycloak-Id header
} as const;

/**
 * Détermine si un endpoint Account est public (pas de token requis)
 * @param url - URL de l'endpoint
 * @param method - Méthode HTTP (GET, POST, etc.)
 */
export function isPublicAccountEndpoint(url: string, method: string): boolean {
  const upperMethod = method.toUpperCase();

  // Tous les GET sur professions, restaurant, producer, user/username sont publics
  if (upperMethod === 'GET') {
    if (url.includes('/account/professions') ||
        url.includes('/account/restaurant') ||
        url.includes('/account/producer') ||
        url.includes('/account/user/username/')) {
      return true;
    }
  }

  // Tout le reste nécessite une authentification
  return false;
}

/**
 * Storage keys for AsyncStorage
 */
export const ACCOUNT_STORAGE_KEYS = {
  PENDING_NOTIFICATIONS: '@account/pending-notifications',
} as const;

/**
 * Legacy endpoints (for backward compatibility with retry queue)
 */
export const ACCOUNT_LEGACY_ENDPOINTS = {
  // Keycloak notification endpoint (used by retry queue)
  KEYCLOAK_NOTIFICATION: `${API_GATEWAY_BASE_URL}${ACCOUNT_PREFIX}/user`, // POST PRIVATE
} as const;

