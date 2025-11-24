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
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  icon?: string; // Custom field for frontend
}

// ============================================
// Unit Types
// ============================================

export interface UnitResponse {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  code?: string;
  abbreviation?: string;
}

// ============================================
// Currency Types
// ============================================

export interface CurrencyResponse {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

// ============================================
// Shelf Types
// ============================================

export interface ShelfResponse {
  id: number;
  label: string;
  producerId: number;
  name?: string; // Pour compatibilité ascendante
  nameEn?: string;
  nameFr?: string;
  code?: string;
  description?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

// ============================================
// Certification Types
// ============================================

export interface ProductCertificationResponse {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  code?: string;
  description?: string;
  logoUrl?: string;
}

