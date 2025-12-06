/**
 * Token Manager
 *
 * Gestion centralisée des tokens JWT avec refresh automatique
 * Utilise expo-secure-store pour stocker les tokens de manière sécurisée
 */

import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string; // Keycloak user ID
  exp: number; // Expiration timestamp (seconds)
  iat: number; // Issued at
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly ID_TOKEN_KEY = 'id_token';
  private static readonly USER_ID_KEY = 'user_id';

  private static readonly KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG || '';
  private static readonly CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || '';
  private static readonly REFRESH_THRESHOLD = 30; // Refresh 30 secondes avant expiration

  /**
   * Sauvegarder les tokens après connexion
   */
  static async saveTokens(tokens: Tokens): Promise<void> {
    try {
      const payload = this.decodeToken(tokens.accessToken);

      if (!payload) {
        console.error('[TokenManager] Invalid access token payload');
        throw new Error('Invalid access token');
      }

      // SecureStore n'accepte que des chaînes non vides
      if (tokens.accessToken && typeof tokens.accessToken === 'string') {
        await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      }

      if (tokens.refreshToken && typeof tokens.refreshToken === 'string') {
        await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      }

      if (tokens.idToken && typeof tokens.idToken === 'string') {
        await SecureStore.setItemAsync(this.ID_TOKEN_KEY, tokens.idToken);
      }

      if (payload.sub && typeof payload.sub === 'string') {
        await SecureStore.setItemAsync(this.USER_ID_KEY, payload.sub);
      }

      console.log('[TokenManager] Tokens saved successfully. Expires at:', new Date(payload.exp * 1000).toISOString());
    } catch (error) {
      console.error('[TokenManager] Error saving tokens:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'access token valide (avec refresh automatique si nécessaire)
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const accessToken = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);

      if (!accessToken) {
        console.log('[TokenManager] No access token found in storage');
        return null;
      }

      // Vérifier si le token est expiré ou va expirer bientôt
      if (this.isTokenExpired(accessToken)) {
        console.log('[TokenManager] Token expired or expiring soon, attempting refresh...');
        // Tenter de rafraîchir le token
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          console.log('[TokenManager] Token refreshed successfully');
        } else {
          console.log('[TokenManager] Token refresh failed - user needs to re-authenticate');
        }
        return newToken;
      }

      return accessToken;
    } catch (error) {
      console.error('[TokenManager] Error getting access token:', error);
      return null;
    }
  }

  /**
   * Récupérer le user ID (Keycloak subject)
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.USER_ID_KEY);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Récupérer le refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Récupérer l'ID token
   */
  static async getIdToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.ID_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Décoder le payload d'un token JWT (sans vérification de signature)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Vérifier si un token est expiré (avec marge de sécurité)
   */
  private static isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now + this.REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  private static async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        console.log('[TokenManager] No refresh token available');
        await this.clearTokens();
        return null;
      }

      console.log('[TokenManager] Calling Keycloak to refresh token...');
      const response = await fetch(
        `${this.KEYCLOAK_URL}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.CLIENT_ID,
          }).toString(),
        }
      );

      if (!response.ok) {
        // Refresh token invalide/expiré
        const errorText = await response.text();
        console.error('[TokenManager] Token refresh failed:', response.status, errorText);
        await this.clearTokens();
        return null;
      }

      const data = await response.json();
      console.log('[TokenManager] Keycloak returned new tokens');

      // Sauvegarder les nouveaux tokens
      await this.saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
      });

      return data.access_token;
    } catch (error) {
      console.error('[TokenManager] Error refreshing token:', error);
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Supprimer tous les tokens (logout)
   */
  static async clearTokens(): Promise<void> {
    try {
      console.log('[TokenManager] Clearing all tokens');
      await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.ID_TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.USER_ID_KEY);
    } catch (error) {
      console.error('[TokenManager] Error clearing tokens:', error);
    }
  }

  /**
   * Vérifier si un utilisateur est authentifié
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Obtenir les informations utilisateur depuis le token
   */
  static async getUserInfo(): Promise<TokenPayload | null> {
    const token = await this.getAccessToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }
}

