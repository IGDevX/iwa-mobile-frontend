/**
 * Shop Service Index
 *
 * Export all shop service functions and types
 */

// Export all types
export type {
  CategoryResponse,
  CurrencyResponse,
  ProductCertificationResponse,
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
  ShelfResponse,
  UnitResponse,
} from './shopApi';

// Export all service functions
export {
  createProduct,
  deleteProduct,
  getAllCategories,
  getAllCertifications,
  getAllCurrencies,
  getAllProducts,
  getAllShelves,
  getAllUnits,
  getCategory,
  getProduct,
  getProductsByProducer,
  updateProduct,
} from './shopService';

// Export configuration
export { SHOP_ENDPOINTS, SHOP_SERVICE_BASE_URL } from './shopConfig';

