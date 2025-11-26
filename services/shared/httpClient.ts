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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Ajouter le token si la route nécessite une authentification
    if (requiresAuth) {
      const token = await TokenManager.getAccessToken();

      if (!token) {
        throw new Error('UNAUTHENTICATED');
      }

      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Gérer le cas 401 (token invalide)
    if (response.status === 401 && requiresAuth) {
      // Le token a été rejeté par le backend
      // Le TokenManager a déjà tenté un refresh, si on est ici c'est que ça a échoué
      await TokenManager.clearTokens();
      throw new Error('UNAUTHENTICATED');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Gérer les réponses vides (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth);
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
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      requiresAuth
    );
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

