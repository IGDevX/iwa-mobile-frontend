/**
 * Account Service HTTP Client
 *
 * Client HTTP pour le Account Service via l'API Gateway
 * Utilise HttpClient centralisé avec gestion automatique des tokens
 * Le token est automatiquement ajouté s'il existe (même pour les routes publiques)
 */

import { HttpClient } from '../shared/httpClient';
import { API_GATEWAY_BASE_URL } from '../../constants/Config';

// Créer une instance du client HTTP pour Account Service
const accountClient = new HttpClient(`${API_GATEWAY_BASE_URL}/account`);

/**
 * Effectue une requête GET
 */
export async function accountGet<T>(endpoint: string): Promise<T> {
  return accountClient.get<T>(endpoint);
}

/**
 * Effectue une requête POST
 */
export async function accountPost<T>(endpoint: string, body?: any): Promise<T> {
  return accountClient.post<T>(endpoint, body);
}

/**
 * Effectue une requête PUT
 */
export async function accountPut<T>(endpoint: string, body: any): Promise<T> {
  return accountClient.put<T>(endpoint, body);
}

/**
 * Effectue une requête PATCH
 */
export async function accountPatch<T>(endpoint: string, body: any): Promise<T> {
  return accountClient.patch<T>(endpoint, body);
}

/**
 * Effectue une requête DELETE
 */
export async function accountDelete<T>(endpoint: string): Promise<T> {
  return accountClient.delete<T>(endpoint);
}




