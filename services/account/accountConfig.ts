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

    // Profil utilisateur actuel (requiert X-Keycloak-Id header)
    ME: '/me', // GET PRIVATE - retourne le profil de l'utilisateur connecté
    UPDATE_ME: '/me', // PUT PRIVATE

    // Endpoint interne pour créer/récupérer un user par Keycloak ID (auto-création)
    GET_OR_CREATE_USER_BY_KEYCLOAK_ID: (keycloakId: string) =>
        `/internal/${keycloakId}`, // GET PRIVATE - crée le user s'il n'existe pas

    // Endpoint interne pour récupérer le Keycloak ID à partir d'un User ID
    GET_KEYCLOAK_ID_BY_USER_ID: (userId: number) =>
        `/internal/user/${userId}/keycloak-id`, // GET INTERNAL - retourne le Keycloak ID

    // DEPRECATED: Ces endpoints n'existent pas sur le backend
    // GET_USER_BY_KEYCLOAK_ID: (keycloakId: string) =>
    //     `/user/keycloak/${keycloakId}`,
    // GET_USER_BY_USERNAME: (username: string) =>
    //     `/user/username/${username}`,

    // ============================================
    // Professions (Référentiel)
    // ============================================
    GET_ALL_PROFESSIONS: '/professions', // GET PUBLIC

    // ============================================
    // Restaurant Management
    // ============================================
    GET_RESTAURANT_BY_ID: (restaurantId: number) =>
        `/restaurant/${restaurantId}`, // GET PUBLIC
    GET_ALL_RESTAURANTS: '/restaurant', // GET PUBLIC
    CREATE_RESTAURANT: '/restaurant', // POST PRIVATE
    UPDATE_RESTAURANT: '/restaurant', // PUT PRIVATE
    DELETE_RESTAURANT: '/restaurant', // DELETE PRIVATE (utilise X-Keycloak-Id)

    // ============================================
    // Producer Management
    // ============================================
    GET_PRODUCER_BY_ID: (producerId: number) =>
        `/producer/${producerId}`, // GET PUBLIC
    GET_ALL_PRODUCERS: '/producer', // GET PUBLIC
    CREATE_PRODUCER: '/producer', // POST PRIVATE
    UPDATE_PRODUCER: '/producer', // PUT PRIVATE
    DELETE_PRODUCER: '/producer', // DELETE PRIVATE (utilise X-Keycloak-Id)

    // ============================================
    // Address Management
    // ============================================
    GET_USER_ADDRESSES: '/address', // GET PRIVATE
    CREATE_ADDRESS: '/address', // POST PRIVATE
    UPDATE_ADDRESS: (addressId: number) =>
        `/address/${addressId}`, // PUT PRIVATE
    DELETE_ADDRESS: (addressId: number) =>
        `/address/${addressId}`, // DELETE PRIVATE

    // ============================================
    // Professions (Référentiel)
    // ============================================
    GET_PROFESSIONS: '/professions', // GET PUBLIC
    GET_PROFESSION_BY_ID: (id: string) =>
        `/professions/${id}`, // GET PUBLIC

    // ============================================
    // Producer Professions Management
    // ============================================
    ADD_PRODUCER_PROFESSION: (professionId: string | number) =>
        `/producer/professions/${professionId}`, // POST PRIVATE
    REMOVE_PRODUCER_PROFESSION: (professionId: string | number) =>
        `/producer/professions/${professionId}`, // DELETE PRIVATE

    // ============================================
    // Aliases pour compatibilité
    // ============================================
    GET_PRODUCER: (id: string | number) =>
        `/producer/${id}`, // GET PUBLIC
    GET_RESTAURANT: (id: string | number) =>
        `/restaurant/${id}`, // GET PUBLIC
} as const;

/**
 * Détermine si un endpoint Account est public (pas de token requis)
 * @param endpoint - Path relatif de l'endpoint (ex: /me, /professions)
 * @param method - Méthode HTTP (GET, POST, etc.)
 */
export function isPublicAccountEndpoint(endpoint: string, method: string): boolean {
    const upperMethod = method.toUpperCase();

    // Tous les GET sur professions, restaurant, producer, user/username sont publics
    if (upperMethod === 'GET') {
        if (endpoint.includes('/professions') ||
            endpoint.includes('/restaurant') ||
            endpoint.includes('/producer') ||
            endpoint.includes('/user/username/')) {
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
    KEYCLOAK_NOTIFICATION: '/user', // POST PRIVATE
} as const;