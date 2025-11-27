/**
 * HTTP Client centralisé
 *
 * Client HTTP partagé pour tous les services
 * Gère automatiquement :
 * - Ajout du token JWT si disponible
 * - Refresh automatique du token
 * - Retry après refresh
 */

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
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`📡 [HTTP-CLIENT] ${options.method || 'GET'} ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Ajouter le token si la route nécessite une authentification
    if (requiresAuth) {
      const token = await TokenManager.getAccessToken();

      if (!token) {
        console.error('❌ [HTTP-CLIENT] No token available');
        throw new Error('UNAUTHENTICATED');
      }

      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 [HTTP-CLIENT] Auth token added');
    }

    if (options.body) {
      console.log('📦 [HTTP-CLIENT] Request body:', options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📥 [HTTP-CLIENT] Response: ${response.status} ${response.statusText}`);

    // Gérer le cas 401 (token invalide)
    if (response.status === 401 && requiresAuth) {
      // Le token a été rejeté par le backend
      // Le TokenManager a déjà tenté un refresh, si on est ici c'est que ça a échoué
      console.error('❌ [HTTP-CLIENT] 401 Unauthorized - clearing tokens');
      await TokenManager.clearTokens();
      throw new Error('UNAUTHENTICATED');
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

    return response.json();
  }

  /**
   * GET request with automatic deduplication
   * If the same GET request is already pending, return the existing promise
   */
  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    const cacheKey = `${endpoint}|${requiresAuth}`;

    // Check if the same GET request is already in progress
    if (this.pendingGetRequests.has(cacheKey)) {
      console.log(`⏳ [HTTP-CLIENT] GET already pending, reusing promise: ${endpoint}`);
      return this.pendingGetRequests.get(cacheKey)! as Promise<T>;
    }

    // Create new request promise
    const requestPromise = this.request<T>(endpoint, { method: 'GET' }, requiresAuth)
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
  async post<T>(
    endpoint: string,
    body?: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      requiresAuth
    );
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    console.log('🔵 [HTTP-CLIENT] PUT request:', {
      baseUrl: this.baseUrl,
      endpoint,
      body,
      requiresAuth,
    });

    try {
      const result = await this.request<T>(
        endpoint,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        },
        requiresAuth
      );
      console.log('✅ [HTTP-CLIENT] PUT success');
      return result;
    } catch (error) {
      console.error('❌ [HTTP-CLIENT] PUT failed:', error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      requiresAuth
    );
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }
}

