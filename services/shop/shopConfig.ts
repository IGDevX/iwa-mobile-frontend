/**
 * Shop Service Configuration
 *
 * Configuration pour l'accès au Shop Service via l'API Gateway
 * Architecture centralisée : Toutes les requêtes passent par localhost:8080
 */

import { API_GATEWAY_BASE_URL } from '../../constants/Config';

// Préfixe pour le Shop Service dans la Gateway
const SHOP_PREFIX = '/shop';

/**
 * Shop Service API Endpoints via Gateway
 *
 * IMPORTANT - Règles de Sécurité :
 * - Tous les GET /shop/** sont PUBLICS (pas de token requis)
 * - POST /shop/products/search est PUBLIC
 * - Toutes les autres routes nécessitent un token JWT
 */
export const SHOP_ENDPOINTS = {
  // Products (GET = public, autres = privé)
  GET_ALL_PRODUCTS: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products`,
  GET_PRODUCT: (id: string | number) => `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products/${id}`,
  SEARCH_PRODUCTS: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products/search`, // POST PUBLIC
  CREATE_PRODUCT: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products`, // POST PRIVATE
  UPDATE_PRODUCT: (id: string | number) => `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products/${id}`, // PUT/PATCH PRIVATE
  DELETE_PRODUCT: (id: string | number) => `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products/${id}`, // DELETE PRIVATE
  GET_PRODUCTS_BY_PRODUCER: (producerId: string | number, shelfId?: string | number) => {
    let url = `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/products/producer/${producerId}`;
    if (shelfId) {
      url += `?shelfId=${shelfId}`;
    }
    return url;
  }, // GET PUBLIC

  // Categories (GET = public)
  GET_ALL_CATEGORIES: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/categories`,
  GET_CATEGORY: (id: string | number) => `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/categories/${id}`,

  // Units (GET = public)
  GET_ALL_UNITS: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/units`,

  // Currencies (GET = public)
  GET_ALL_CURRENCIES: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/currencies`,

  // Shelves (GET = public)
  GET_ALL_SHELVES: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/shelves`,
  GET_SHELVES_BY_PRODUCER: (producerId: string | number) =>
    `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/shelves/producer/${producerId}`, // GET PUBLIC

  // Certifications (GET = public)
  GET_ALL_CERTIFICATIONS: `${API_GATEWAY_BASE_URL}${SHOP_PREFIX}/certifications`,
} as const;

/**
 * Détermine si un endpoint est public (pas de token requis)
 * @param url - URL de l'endpoint
 * @param method - Méthode HTTP (GET, POST, etc.)
 */
export function isPublicShopEndpoint(url: string, method: string): boolean {
  const upperMethod = method.toUpperCase();

  // Tous les GET /shop/** sont publics
  if (upperMethod === 'GET' && url.includes('/shop/')) {
    return true;
  }

  // POST /shop/products/search est public
  if (upperMethod === 'POST' && url.includes('/shop/products/search')) {
    return true;
  }

  return false;
}

