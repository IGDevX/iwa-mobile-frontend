/**
 * Shop Service HTTP Client
 *
 * Client HTTP spécifique pour le Shop Service via l'API Gateway
 * Gère l'authentification selon les règles de sécurité :
 * - Routes publiques : Tous les GET et POST /products/search
 * - Routes privées : Tous les POST/PUT/DELETE (sauf search)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPublicShopEndpoint } from './shopConfig';

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
      console.log('🔑 [SHOP] Token récupéré depuis AsyncStorage');
    } else {
      console.warn('⚠️ [SHOP] Aucun token trouvé dans AsyncStorage');
    }
    return token;
  } catch (error) {
    console.error('❌ [SHOP] Error retrieving access token:', error);
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
  const isPublic = isPublicShopEndpoint(url, method);

  // Préparer les headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Ajouter le token uniquement pour les routes privées
  if (!isPublic) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`🔐 [SHOP] Route privée - Token ajouté pour ${method} ${url}`);
    } else {
      console.warn(`⚠️ [SHOP] Route privée mais pas de token disponible pour ${method} ${url}`);
    }
  } else {
    console.log(`🌍 [SHOP] Route publique - Pas de token pour ${method} ${url}`);
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  console.log(`📡 [SHOP] ${method} ${url}`);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [SHOP] Erreur ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    console.log(`✅ [SHOP] Réponse reçue pour ${method} ${url}`);
    return data;
  } catch (error) {
    console.error(`❌ [SHOP] Erreur réseau pour ${method} ${url}:`, error);
    throw error;
  }
}

/**
 * Effectue une requête GET
 */
export async function shopGet<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'GET', undefined, options);
}

/**
 * Effectue une requête POST
 */
export async function shopPost<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'POST', body, options);
}

/**
 * Effectue une requête PUT
 */
export async function shopPut<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'PUT', body, options);
}

/**
 * Effectue une requête PATCH
 */
export async function shopPatch<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'PATCH', body, options);
}

/**
 * Effectue une requête DELETE
 */
export async function shopDelete<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, 'DELETE', undefined, options);
}

