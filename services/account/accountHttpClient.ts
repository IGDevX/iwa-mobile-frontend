/**
 * Account Service HTTP Client
 *
 * Client HTTP pour le Account Service via l'API Gateway
 * Utilise HttpClient centralisé avec gestion automatique des tokens
 */

import { HttpClient } from '../shared/httpClient';
import { API_GATEWAY_BASE_URL } from '../../constants/Config';
import { isPublicAccountEndpoint } from './accountConfig';

// Créer une instance du client HTTP pour Account Service
const accountClient = new HttpClient(`${API_GATEWAY_BASE_URL}/account`);

/**
 * Effectue une requête GET
 */
export async function accountGet<T>(endpoint: string): Promise<T> {
  const requiresAuth = !isPublicAccountEndpoint(endpoint, 'GET');
  return accountClient.get<T>(endpoint, requiresAuth);
}

/**
 * Effectue une requête POST
 */
export async function accountPost<T>(endpoint: string, body?: any): Promise<T> {
  const requiresAuth = !isPublicAccountEndpoint(endpoint, 'POST');
  return accountClient.post<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête PUT
 */
export async function accountPut<T>(endpoint: string, body: any): Promise<T> {
  const requiresAuth = !isPublicAccountEndpoint(endpoint, 'PUT');
  return accountClient.put<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête PATCH
 */
export async function accountPatch<T>(endpoint: string, body: any): Promise<T> {
  const requiresAuth = !isPublicAccountEndpoint(endpoint, 'PATCH');
  return accountClient.patch<T>(endpoint, body, requiresAuth);
}

/**
 * Effectue une requête DELETE
 */
export async function accountDelete<T>(endpoint: string): Promise<T> {
  const requiresAuth = !isPublicAccountEndpoint(endpoint, 'DELETE');
  return accountClient.delete<T>(endpoint, requiresAuth);
}




