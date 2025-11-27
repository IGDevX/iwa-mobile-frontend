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
 * Shop Service API Endpoints (paths relatifs)
 *
 * IMPORTANT - Règles de Sécurité :
 * - Tous les GET /shop/** sont PUBLICS (pas de token requis)
 * - POST /shop/products/search est PUBLIC
 * - Toutes les autres routes nécessitent un token JWT
 */
export const SHOP_ENDPOINTS = {
  // Products (GET = public, autres = privé)
  GET_ALL_PRODUCTS: '/products',
  GET_PRODUCT: (id: string | number) => `/products/${id}`,
  SEARCH_PRODUCTS: '/products/search', // POST PUBLIC
  CREATE_PRODUCT: '/products', // POST PRIVATE
  UPDATE_PRODUCT: (id: string | number) => `/products/${id}`, // PUT/PATCH PRIVATE
  DELETE_PRODUCT: (id: string | number) => `/products/${id}`, // DELETE PRIVATE
  GET_PRODUCTS_BY_PRODUCER: (producerId: string | number, shelfId?: string | number) => {
    let url = `/products/producer/${producerId}?onlyDeleted=false`;
    if (shelfId) {
      url += `&shelfId=${shelfId}`;
    }
    return url;
  }, // GET PUBLIC

  // Categories (GET = public)
  GET_ALL_CATEGORIES: '/categories',
  GET_CATEGORY: (id: string | number) => `/categories/${id}`,

  // Units (GET = public)
  GET_ALL_UNITS: '/units',

  // Currencies (GET = public)
  GET_ALL_CURRENCIES: '/currencies',

  // Shelves (GET = public, POST/PUT/DELETE = privé)
  GET_ALL_SHELVES: '/shelves',
  GET_SHELVES_BY_PRODUCER: (producerId: string | number) =>
    `/shelves/producer/${producerId}`, // GET PUBLIC
  CREATE_SHELF: '/shelves', // POST PRIVATE
  UPDATE_SHELF: (shelfId: string | number) => `/shelves/${shelfId}`, // PUT PRIVATE
  DELETE_SHELF: (shelfId: string | number) => `/shelves/${shelfId}`, // DELETE PRIVATE

  // Certifications (GET = public)
  GET_ALL_CERTIFICATIONS: '/product-certifications',
} as const;

/**
 * Détermine si un endpoint est public (pas de token requis)
 * @param endpoint - Path relatif de l'endpoint (ex: /products, /categories)
 * @param method - Méthode HTTP (GET, POST, etc.)
 */
export function isPublicShopEndpoint(endpoint: string, method: string): boolean {
  const upperMethod = method.toUpperCase();

  // Tous les GET sont publics
  if (upperMethod === 'GET') {
    return true;
  }

  // POST /products/search est public
  if (upperMethod === 'POST' && endpoint.includes('/products/search')) {
    return true;
  }

  return false;
}

