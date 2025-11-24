/**
 * useProducerShop Hook
 *
 * Custom hook to manage producer's shop and products
 * Automatically retrieves producer ID from account service
 */

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getUserByKeycloakId } from '../services/account';
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getProductsByProducer,
  updateProduct,
  type CategoryResponse,
  type ProductRequest,
  type ProductResponse,
  type ProductUpdateRequest,
} from '../services/shop';

interface UseProducerShopReturn {
  producerId: number | null;
  products: ProductResponse[];
  categories: CategoryResponse[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  createNewProduct: (product: Omit<ProductRequest, 'producerId'>) => Promise<ProductResponse>;
  updateExistingProduct: (id: number, product: ProductUpdateRequest) => Promise<ProductResponse>;
  deleteExistingProduct: (id: number) => Promise<void>;
}

export function useProducerShop(): UseProducerShopReturn {
  const { state: authState } = useContext(AuthContext);
  const [producerId, setProducerId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get producer ID from account service
  useEffect(() => {
    const fetchProducerId = async () => {
      try {
        const keycloakId = authState.userInfo?.sub;
        if (!keycloakId) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }

        const profile = await getUserByKeycloakId(keycloakId);
        setProducerId(profile.id);
        setError(null);
      } catch (err) {
        console.error('Error fetching producer ID:', err);
        setError('Failed to fetch producer profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.isSignedIn) {
      fetchProducerId();
    }
  }, [authState.isSignedIn, authState.userInfo?.sub]);

  // Fetch products when producer ID is available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!producerId) return;

      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProductsByProducer(producerId),
          getAllCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [producerId]);

  // Refresh products
  const refreshProducts = async () => {
    if (!producerId) return;

    try {
      setIsLoading(true);
      const productsData = await getProductsByProducer(producerId);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing products:', err);
      setError('Failed to refresh products');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new product
  const createNewProduct = async (
    product: Omit<ProductRequest, 'producerId'>
  ): Promise<ProductResponse> => {
    if (!producerId) {
      throw new Error('Producer ID not available');
    }

    try {
      const newProduct = await createProduct({
        ...product,
        producerId,
      });
      await refreshProducts();
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  // Update an existing product
  const updateExistingProduct = async (
    id: number,
    product: ProductUpdateRequest
  ): Promise<ProductResponse> => {
    try {
      const updatedProduct = await updateProduct(id, product);
      await refreshProducts();
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  // Delete a product
  const deleteExistingProduct = async (id: number): Promise<void> => {
    try {
      await deleteProduct(id);
      await refreshProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return {
    producerId,
    products,
    categories,
    isLoading,
    error,
    refreshProducts,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
  };
}

