/**
 * JWT Utilities
 *
 * Fonctions utilitaires pour manipuler les JWT tokens
 */

/**
 * Décode un JWT token sans vérification de signature (client-side only)
 * ATTENTION: Ne jamais faire confiance à ces données côté serveur
 *
 * @param token - JWT token à décoder
 * @returns Payload décodé ou null si invalide
 */
export function decodeJwtPayload(token: string): any | null {
  try {
    // Un JWT est composé de 3 parties séparées par des points: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWT] Token invalide: ne contient pas 3 parties');
      return null;
    }

    // Décoder la partie payload (base64url)
    const payload = parts[1];

    // Remplacer les caractères base64url par base64 standard
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Ajouter le padding si nécessaire
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    // Décoder en base64 puis parser en JSON
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[JWT] Erreur lors du décodage:', error);
    return null;
  }
}

/**
 * Extrait le Keycloak ID (sub claim) d'un JWT token
 *
 * @param token - JWT token
 * @returns Keycloak ID (UUID) ou null si non trouvé
 */
export function extractKeycloakId(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  // Le Keycloak ID est dans le claim 'sub'
  return payload.sub || null;
}

/**
 * Vérifie si un JWT token est expiré
 *
 * @param token - JWT token
 * @returns true si expiré, false sinon
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp est en secondes, Date.now() est en millisecondes
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Extrait les rôles d'un JWT Keycloak token
 *
 * @param token - JWT token
 * @returns Array de rôles ou array vide
 */
export function extractRoles(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  // Les rôles peuvent être dans différents endroits selon la configuration Keycloak
  const realmRoles = payload.realm_access?.roles || [];
  const resourceRoles = payload.resource_access?.[process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'rn-expo-app']?.roles || [];

  return [...realmRoles, ...resourceRoles];
}

