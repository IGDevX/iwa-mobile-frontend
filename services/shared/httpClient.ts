/**
 * HTTP Client centralisé
 *
 * Client HTTP partagé pour tous les services
 * Gère automatiquement :
 * - Ajout du token JWT si disponible
 * - Refresh automatique du token
 * - Retry après refresh
 */

import { API_TIMEOUT } from '../../constants/Config';
import { TokenManager } from '../auth/tokenManager';

export class HttpClient {
  private baseUrl: string;
  private pendingGetRequests: Map<string, Promise<any>> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Effectuer une requête HTTP avec gestion automatique du token
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`📡 [HTTP-CLIENT] ${options.method || 'GET'} ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Toujours ajouter le token s'il existe (même pour routes publiques)
    const token = await TokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [HTTP-CLIENT] Auth token added');
    } else {
      console.log('ℹ️ [HTTP-CLIENT] No token available (user not logged in)');
    }

    if (options.body) {
      console.log('📦 [HTTP-CLIENT] Request body:', options.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error(`⏱️ [HTTP-CLIENT] Request timed out after ${API_TIMEOUT}ms: ${url}`);
        throw new Error('REQUEST_TIMEOUT');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    console.log(`📥 [HTTP-CLIENT] Response: ${response.status} ${response.statusText}`);

    // Gérer le cas 401 (token invalide)
    if (response.status === 401) {
      // Si un token était présent, cela signifie qu'il est invalide/expiré
      if (token) {
        console.error('❌ [HTTP-CLIENT] 401 Unauthorized - token invalid, clearing tokens');
        await TokenManager.clearTokens();
        throw new Error('UNAUTHENTICATED');
      } else {
        // Pas de token = route nécessite authentification mais user pas connecté
        console.warn('⚠️ [HTTP-CLIENT] 401 - Authentication required (user not logged in)');
        throw new Error('AUTHENTICATION_REQUIRED');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [HTTP-CLIENT] Error ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response safely
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('[HttpClient] Failed to parse JSON response:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  /**
   * GET request with automatic deduplication
   * If the same GET request is already pending, return the existing promise
   */
  async get<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;

    // Check if the same GET request is already in progress
    if (this.pendingGetRequests.has(cacheKey)) {
      console.log(`⏳ [HTTP-CLIENT] GET already pending, reusing promise: ${endpoint}`);
      return this.pendingGetRequests.get(cacheKey)! as Promise<T>;
    }

    // Create new request promise
    const requestPromise = this.request<T>(endpoint, { method: 'GET' })
      .finally(() => {
        // Clean up the cache after request completes (success or failure)
        this.pendingGetRequests.delete(cacheKey);
      });

    // Store the promise in cache
    this.pendingGetRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }
    );
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
