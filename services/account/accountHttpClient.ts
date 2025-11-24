/**
 * Account Service HTTP Client
 *
 * Client HTTP spécifique pour le Account Service via l'API Gateway
 * Gère l'authentification selon les règles de sécurité :
 * - Routes publiques : GET sur professions, restaurant, producer, user/username
 * - Routes privées : Toutes les autres (POST/PUT/DELETE + GET user/keycloak)
 * - Ajoute automatiquement le header X-Keycloak-Id en décodant le JWT
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { extractKeycloakId } from '../../utils/jwtUtils';
import { isPublicAccountEndpoint } from './accountConfig';

interface RequestOptions {
  headers?: Record<string, string>;
  method?: string;
}

/**
 * Récupère le token JWT stocké
 * Note: Utilise la même clé que AuthContext (@auth_token)
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      console.log('🔑 [ACCOUNT] Token récupéré depuis AsyncStorage');
    } else {
      console.warn('⚠️ [ACCOUNT] Aucun token trouvé dans AsyncStorage');
    }
    return token;
  } catch (error) {
    console.error('❌ [ACCOUNT] Error retrieving access token:', error);
    return null;
  }
}

/**
 * Effectue une requête HTTP avec gestion automatique du token
 */
async function request<T>(
  url: string,
  method: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  const isPublic = isPublicAccountEndpoint(url, method);

  // Préparer les headers de base
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Ajouter le token uniquement pour les routes privées
  if (!isPublic) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`🔐 [ACCOUNT] Route privée - Token ajouté pour ${method} ${url}`);

      // Ajouter automatiquement X-Keycloak-Id en décodant le JWT
      // Sauf si déjà fourni dans les options
      if (!options?.headers?.['X-Keycloak-Id']) {
        const keycloakId = extractKeycloakId(token);
        if (keycloakId) {
          headers['X-Keycloak-Id'] = keycloakId;
          console.log(`🆔 [ACCOUNT] X-Keycloak-Id ajouté automatiquement: ${keycloakId.substring(0, 8)}...`);
        } else {
          console.warn(`⚠️ [ACCOUNT] Impossible d'extraire le Keycloak ID du token`);
        }
      }
    } else {
      console.warn(`⚠️ [ACCOUNT] Route privée mais pas de token disponible pour ${method} ${url}`);
    }
  } else {
    console.log(`🌍 [ACCOUNT] Route publique - Pas de token pour ${method} ${url}`);
  }

  // Fusionner avec les headers personnalisés (qui peuvent inclure X-Keycloak-Id, etc.)
  if (options?.headers) {
    Object.assign(headers, options.headers);
    console.log(`📋 [ACCOUNT] Headers personnalisés ajoutés:`, Object.keys(options.headers));
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  console.log(`📡 [ACCOUNT] ${method} ${url}`);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ACCOUNT] Erreur ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    console.log(`✅ [ACCOUNT] Réponse reçue pour ${method} ${url}`);
    return data;
  } catch (error) {
    console.error(`❌ [ACCOUNT] Erreur réseau pour ${method} ${url}:`, error);
    throw error;
  }
}

/**
 * Effectue une requête GET
 */
export async function accountGet<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'GET', undefined, options);
}

/**
 * Effectue une requête POST
 */
export async function accountPost<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'POST', body, options);
}

/**
 * Effectue une requête PUT
 */
export async function accountPut<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'PUT', body, options);
}

/**
 * Effectue une requête PATCH
 */
export async function accountPatch<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'PATCH', body, options);
}

/**
 * Effectue une requête DELETE
 */
export async function accountDelete<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'DELETE', undefined, options);
}

