/**
 * Shop Service Configuration
 *
 * Configuration for the Shop Service API endpoints
 */

// Shop Service base URL
export const SHOP_SERVICE_BASE_URL = process.env.EXPO_PUBLIC_SHOP_SERVICE_URL || 'http://localhost:5002';

// Shop Service API Endpoints
export const SHOP_ENDPOINTS = {
  // Products
  GET_ALL_PRODUCTS: `${SHOP_SERVICE_BASE_URL}/api/products`,
  GET_PRODUCT: (id: string | number) => `${SHOP_SERVICE_BASE_URL}/api/products/${id}`,
  CREATE_PRODUCT: `${SHOP_SERVICE_BASE_URL}/api/products`,
  UPDATE_PRODUCT: (id: string | number) => `${SHOP_SERVICE_BASE_URL}/api/products/${id}`,
  DELETE_PRODUCT: (id: string | number) => `${SHOP_SERVICE_BASE_URL}/api/products/${id}`,
  GET_PRODUCTS_BY_PRODUCER: (producerId: string | number) =>
    `${SHOP_SERVICE_BASE_URL}/api/products?producerId=${producerId}`,

  // Categories
  GET_ALL_CATEGORIES: `${SHOP_SERVICE_BASE_URL}/api/categories`,
  GET_CATEGORY: (id: string | number) => `${SHOP_SERVICE_BASE_URL}/api/categories/${id}`,

  // Units
  GET_ALL_UNITS: `${SHOP_SERVICE_BASE_URL}/api/units`,

  // Currencies
  GET_ALL_CURRENCIES: `${SHOP_SERVICE_BASE_URL}/api/currencies`,

  // Shelves
  GET_ALL_SHELVES: `${SHOP_SERVICE_BASE_URL}/api/shelves`,

  // Certifications
  GET_ALL_CERTIFICATIONS: `${SHOP_SERVICE_BASE_URL}/api/certifications`,
} as const;

