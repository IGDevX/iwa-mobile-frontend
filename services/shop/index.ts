/**
 * Shop Service Index
 *
 * Export all shop service functions and types
 */

// Export all types
export type {
  CategoryResponse,
  CurrencyResponse,
  PaginatedProductsResponse,
  ProductCertificationResponse,
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  ShelfRequest,
  ShelfResponse,
  UnitResponse,
} from './shopApi';

// Export all service functions
export {
  createProduct,
  createShelf,
  deleteProduct,
  deleteShelf,
  getAllCategories,
  getAllCertifications,
  getAllCurrencies,
  getAllProducts,
  getAllShelves,
  getAllUnits,
  getCategory,
  getProduct,
  getProductsByProducer,
  getShelvesByProducer,
  updateProduct,
  updateShelf,
} from './shopService';

// Export configuration
export { SHOP_ENDPOINTS } from './shopConfig';

