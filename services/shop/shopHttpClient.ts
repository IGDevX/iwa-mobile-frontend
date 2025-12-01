/**
 * Shop Service HTTP Client
 *
 * Client HTTP pour le Shop Service via l'API Gateway
 * Utilise HttpClient centralisé avec gestion automatique des tokens
 * Le token est automatiquement ajouté s'il existe (même pour les routes publiques)
 */

import { HttpClient } from '../shared/httpClient';
import { API_GATEWAY_BASE_URL } from '../../constants/Config';

// Créer une instance du client HTTP pour Shop Service
const shopClient = new HttpClient(`${API_GATEWAY_BASE_URL}/shop`);

/**
 * Effectue une requête GET
 */
export async function shopGet<T>(endpoint: string): Promise<T> {
  return shopClient.get<T>(endpoint);
}

/**
 * Effectue une requête POST
 */
export async function shopPost<T>(endpoint: string, body?: any): Promise<T> {
  return shopClient.post<T>(endpoint, body);
}

/**
 * Effectue une requête PUT
 */
export async function shopPut<T>(endpoint: string, body: any): Promise<T> {
  return shopClient.put<T>(endpoint, body);
}

/**
 * Effectue une requête PATCH
 */
export async function shopPatch<T>(endpoint: string, body: any): Promise<T> {
  return shopClient.patch<T>(endpoint, body);
}

/**
 * Effectue une requête DELETE
 */
export async function shopDelete<T>(endpoint: string): Promise<T> {
  return shopClient.delete<T>(endpoint);
}

