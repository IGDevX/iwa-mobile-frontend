/**
 * Shop Service
 *
 * API service for interacting with the Shop Service backend.
 * Handles products, categories, units, currencies, shelves, and certifications.
 */

import { httpDelete, httpGet, httpPost, httpPut } from '../shared/httpClient';
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
 * Get all products
 * @returns Array of products
 */
export async function getAllProducts(): Promise<ProductResponse[]> {
  return httpGet<ProductResponse[]>(SHOP_ENDPOINTS.GET_ALL_PRODUCTS);
}

/**
 * Get a single product by ID
 * @param id - Product ID
 * @returns Product details
 */
export async function getProduct(id: string | number): Promise<ProductResponse> {
  return httpGet<ProductResponse>(SHOP_ENDPOINTS.GET_PRODUCT(id));
}

/**
 * Get all products for a specific producer
 * @param producerId - Producer ID from Account Service
 * @returns Array of products
 */
export async function getProductsByProducer(producerId: string | number): Promise<ProductResponse[]> {
  return httpGet<ProductResponse[]>(SHOP_ENDPOINTS.GET_PRODUCTS_BY_PRODUCER(producerId));
}

/**
 * Create a new product
 * @param request - Product data
 * @returns Created product
 */
export async function createProduct(request: ProductRequest): Promise<ProductResponse> {
  return httpPost<ProductResponse>(SHOP_ENDPOINTS.CREATE_PRODUCT, request);
}

/**
 * Update an existing product
 * @param id - Product ID
 * @param request - Updated product data
 * @returns Updated product
 */
export async function updateProduct(
  id: string | number,
  request: ProductUpdateRequest
): Promise<ProductResponse> {
  return httpPut<ProductResponse>(SHOP_ENDPOINTS.UPDATE_PRODUCT(id), request);
}

/**
 * Delete a product
 * @param id - Product ID
 */
export async function deleteProduct(id: string | number): Promise<void> {
  return httpDelete<void>(SHOP_ENDPOINTS.DELETE_PRODUCT(id));
}

// ============================================
// Category Functions
// ============================================

/**
 * Get all categories
 * @returns Array of categories
 */
export async function getAllCategories(): Promise<CategoryResponse[]> {
  return httpGet<CategoryResponse[]>(SHOP_ENDPOINTS.GET_ALL_CATEGORIES);
}

/**
 * Get a single category by ID
 * @param id - Category ID
 * @returns Category details
 */
export async function getCategory(id: string | number): Promise<CategoryResponse> {
  return httpGet<CategoryResponse>(SHOP_ENDPOINTS.GET_CATEGORY(id));
}

// ============================================
// Unit Functions
// ============================================

/**
 * Get all units
 * @returns Array of units
 */
export async function getAllUnits(): Promise<UnitResponse[]> {
  return httpGet<UnitResponse[]>(SHOP_ENDPOINTS.GET_ALL_UNITS);
}

// ============================================
// Currency Functions
// ============================================

/**
 * Get all currencies
 * @returns Array of currencies
 */
export async function getAllCurrencies(): Promise<CurrencyResponse[]> {
  return httpGet<CurrencyResponse[]>(SHOP_ENDPOINTS.GET_ALL_CURRENCIES);
}

// ============================================
// Shelf Functions
// ============================================

/**
 * Get all shelves
 * @returns Array of shelves
 */
export async function getAllShelves(): Promise<ShelfResponse[]> {
  return httpGet<ShelfResponse[]>(SHOP_ENDPOINTS.GET_ALL_SHELVES);
}

// ============================================
// Certification Functions
// ============================================

/**
 * Get all certifications
 * @returns Array of certifications
 */
export async function getAllCertifications(): Promise<ProductCertificationResponse[]> {
  return httpGet<ProductCertificationResponse[]>(SHOP_ENDPOINTS.GET_ALL_CERTIFICATIONS);
}

