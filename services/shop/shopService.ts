/**
 * Shop Service
 *
 * API service pour interagir avec le Shop Service via l'API Gateway.
 * Gère les produits, catégories, unités, devises, rayons et certifications.
 *
 * Architecture : Toutes les requêtes passent par localhost:8080/shop
 */

import { shopDelete, shopGet, shopPost, shopPut } from './shopHttpClient';
import type {
  CategoryResponse,
  CurrencyResponse,
  ProductCertificationResponse,
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  ShelfResponse,
  UnitResponse,
} from './shopApi';
import { SHOP_ENDPOINTS } from './shopConfig';

// ============================================
// Product Functions
// ============================================

/**
 * Get all products (PUBLIC)
 * @returns Array of products
 */
export async function getAllProducts(): Promise<ProductResponse[]> {
  return shopGet<ProductResponse[]>(SHOP_ENDPOINTS.GET_ALL_PRODUCTS);
}

/**
 * Get a single product by ID (PUBLIC)
 * @param id - Product ID
 * @returns Product details
 */
export async function getProduct(id: string | number): Promise<ProductResponse> {
  return shopGet<ProductResponse>(SHOP_ENDPOINTS.GET_PRODUCT(id));
}

/**
 * Get all products for a specific producer (PUBLIC)
 * @param producerId - Producer ID from Account Service
 * @param shelfId - Optional shelf ID to filter by
 * @returns Array of products
 */
export async function getProductsByProducer(
  producerId: string | number,
  shelfId?: string | number
): Promise<ProductResponse[]> {
  const response = await shopGet<{ products: ProductResponse[] }>(
    SHOP_ENDPOINTS.GET_PRODUCTS_BY_PRODUCER(producerId, shelfId)
  );
  // L'API retourne { products: [...], totalElements, totalPages, ... }
  // On extrait juste le tableau products
  return response.products;
}

/**
 * Create a new product (PRIVATE - Requires JWT)
 * @param request - Product data
 * @returns Created product
 */
export async function createProduct(request: ProductRequest): Promise<ProductResponse> {
  return shopPost<ProductResponse>(SHOP_ENDPOINTS.CREATE_PRODUCT, request);
}

/**
 * Update an existing product (PRIVATE - Requires JWT)
 * @param id - Product ID
 * @param request - Updated product data
 * @returns Updated product
 */
export async function updateProduct(
  id: string | number,
  request: ProductUpdateRequest
): Promise<ProductResponse> {
  return shopPut<ProductResponse>(SHOP_ENDPOINTS.UPDATE_PRODUCT(id), request);
}

/**
 * Delete a product (PRIVATE - Requires JWT)
 * @param id - Product ID
 */
export async function deleteProduct(id: string | number): Promise<void> {
  return shopDelete<void>(SHOP_ENDPOINTS.DELETE_PRODUCT(id));
}

// ============================================
// Category Functions
// ============================================

/**
 * Get all categories (PUBLIC)
 * @returns Array of categories
 */
export async function getAllCategories(): Promise<CategoryResponse[]> {
  return shopGet<CategoryResponse[]>(SHOP_ENDPOINTS.GET_ALL_CATEGORIES);
}

/**
 * Get a single category by ID (PUBLIC)
 * @param id - Category ID
 * @returns Category details
 */
export async function getCategory(id: string | number): Promise<CategoryResponse> {
  return shopGet<CategoryResponse>(SHOP_ENDPOINTS.GET_CATEGORY(id));
}

// ============================================
// Unit Functions
// ============================================

/**
 * Get all units (PUBLIC)
 * @returns Array of units
 */
export async function getAllUnits(): Promise<UnitResponse[]> {
  return shopGet<UnitResponse[]>(SHOP_ENDPOINTS.GET_ALL_UNITS);
}

// ============================================
// Currency Functions
// ============================================

/**
 * Get all currencies (PUBLIC)
 * @returns Array of currencies
 */
export async function getAllCurrencies(): Promise<CurrencyResponse[]> {
  return shopGet<CurrencyResponse[]>(SHOP_ENDPOINTS.GET_ALL_CURRENCIES);
}

// ============================================
// Shelf Functions
// ============================================

/**
 * Get all shelves (PUBLIC)
 * @returns Array of shelves
 */
export async function getAllShelves(): Promise<ShelfResponse[]> {
  return shopGet<ShelfResponse[]>(SHOP_ENDPOINTS.GET_ALL_SHELVES);
}

/**
 * Get shelves by producer (PUBLIC)
 * @param producerId - Producer ID
 * @returns Array of shelves for this producer
 */
export async function getShelvesByProducer(producerId: string | number): Promise<ShelfResponse[]> {
  return shopGet<ShelfResponse[]>(SHOP_ENDPOINTS.GET_SHELVES_BY_PRODUCER(producerId));
}

// ============================================
// Certification Functions
// ============================================

/**
 * Get all certifications (PUBLIC)
 * @returns Array of certifications
 */
export async function getAllCertifications(): Promise<ProductCertificationResponse[]> {
  return shopGet<ProductCertificationResponse[]>(SHOP_ENDPOINTS.GET_ALL_CERTIFICATIONS);
}

