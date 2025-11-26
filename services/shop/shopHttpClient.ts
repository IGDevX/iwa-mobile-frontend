/**
 * Shop Service HTTP Client
 *
 * Client HTTP pour le Shop Service via l'API Gateway
 * Utilise HttpClient centralisé avec gestion automatique des tokens
 */

import { HttpClient } from '../shared/httpClient';
import { API_GATEWAY_BASE_URL } from '../../constants/Config';
import { isPublicShopEndpoint } from './shopConfig';

// Créer une instance du client HTTP pour Shop Service
const shopClient = new HttpClient(`${API_GATEWAY_BASE_URL}/shop`);

/**
 * Effectue une requête GET
 */
export async function shopGet<T>(endpoint: string): Promise<T> {
  const requiresAuth = !isPublicShopEndpoint(endpoint, 'GET');
  return shopClient.get<T>(endpoint, requiresAuth);
}

/**
 * Effectue une requête POST
 */
export async function shopPost<T>(endpoint: string, body?: any): Promise<T> {
  const requiresAuth = !isPublicShopEndpoint(endpoint, 'POST');
  return shopClient.post<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête PUT
 */
export async function shopPut<T>(endpoint: string, body: any): Promise<T> {
  const requiresAuth = !isPublicShopEndpoint(endpoint, 'PUT');
  return shopClient.put<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête PATCH
 */
export async function shopPatch<T>(endpoint: string, body: any): Promise<T> {
  const requiresAuth = !isPublicShopEndpoint(endpoint, 'PATCH');
  return shopClient.patch<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête DELETE
 */
export async function shopDelete<T>(endpoint: string): Promise<T> {
  const requiresAuth = !isPublicShopEndpoint(endpoint, 'DELETE');
  return shopClient.delete<T>(endpoint, requiresAuth);
}

