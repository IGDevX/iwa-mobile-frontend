/**
 * Shop Service API Type Definitions
 *
 * TypeScript interfaces for Shop Service API requests and responses
 */

// ============================================
// Product Types
// ============================================

export interface PaginatedProductsResponse {
  products: ProductResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductRequest {
  title: string;
  description?: string;
  price: number;
  currencyId: number;
  unitId: number;
  shelfId: number;
  categoryId: number;
  certificationIds?: number[];
  isFresh?: boolean;
  mainImageId?: string;
  mainImageUrl?: string;
  producerId: number;
}

export interface ProductResponse {
  id: number;
  title: string;
  description?: string;
  price: number;
  currency: CurrencyResponse;
  unit: UnitResponse;
  shelf: ShelfResponse;
  category: CategoryResponse;
  certifications?: ProductCertificationResponse[];
  isFresh: boolean;
  mainImageId?: string;
  mainImageUrl?: string;
  producerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  currencyId?: number;
  unitId?: number;
  shelfId?: number;
  categoryId?: number;
  certificationIds?: number[];
  isFresh?: boolean;
  mainImageId?: string;
  mainImageUrl?: string;
}

// ============================================
// Category Types
// ============================================

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// ============================================
// Unit Types
// ============================================

export interface UnitResponse {
  id: number;
  code: string;
  label: string;
}

// ============================================
// Currency Types
// ============================================

export interface CurrencyResponse {
  id: number;
  code: string;
  label: string;
  usdExchangeRate: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// ============================================
// Shelf Types
// ============================================

export interface ShelfResponse {
  id: number;
  label: string;
  producerId: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ShelfRequest {
  label: string;
  producerId: number;
}

// ============================================
// Certification Types
// ============================================

export interface ProductCertificationResponse {
  id: number;
  label: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

