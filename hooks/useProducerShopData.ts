/**
 * useProducerShopData Hook
 *
 * Hook personnalisé pour gérer les données de la boutique d'un producteur
 * Récupère les shelves et les produits organisés par shelf
 */

import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getUserByKeycloakId } from '../services/account';
import {
  getProductsByProducer,
  getShelvesByProducer,
  type ProductResponse,
  type ShelfResponse,
} from '../services/shop';

export interface ProductsByShelf {
  [shelfId: number]: ProductResponse[];
}

interface UseProducerShopDataReturn {
  producerId: number | null;
  shelves: ShelfResponse[];
  productsByShelf: ProductsByShelf;
  allProducts: ProductResponse[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

interface UseProducerShopDataParams {
  externalProducerKeycloakId?: string; // Optional: Keycloak ID of another producer to view their shop
}

export function useProducerShopData(params?: UseProducerShopDataParams): UseProducerShopDataReturn {
  const { state: authState } = useContext(AuthContext);
  const [producerId, setProducerId] = useState<number | null>(null);
  const [shelves, setShelves] = useState<ShelfResponse[]>([]);
  const [productsByShelf, setProductsByShelf] = useState<ProductsByShelf>({});
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données (mémorisée avec useCallback)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Récupérer le Producer ID depuis le Keycloak ID
      // Use external producer Keycloak ID if provided, otherwise use current user's
      const keycloakId = params?.externalProducerKeycloakId || authState.userInfo?.sub;
      if (!keycloakId) {
        throw new Error('User not authenticated or no producer ID provided');
      }

      console.log('🔄 [useProducerShopData] Fetching data for Keycloak ID:', keycloakId);
      console.log('🔄 [useProducerShopData] Is external producer:', !!params?.externalProducerKeycloakId);

      const profile = await getUserByKeycloakId(keycloakId);
      const fetchedProducerId = profile.id;
      setProducerId(fetchedProducerId);

      console.log('✅ [useProducerShopData] Producer ID retrieved:', fetchedProducerId);

      // 2. Récupérer les shelves du producteur
      const shelvesData = await getShelvesByProducer(fetchedProducerId);

      // Trier les shelves par id (displayOrder n'existe pas dans ShelfResponse)
      const sortedShelves = shelvesData.sort((a, b) => a.id - b.id);
      setShelves(sortedShelves);

      // 3. Récupérer tous les produits du producteur
      const productsData = await getProductsByProducer(fetchedProducerId);

      setAllProducts(productsData);

      // 4. Organiser les produits par shelf
      const organizedProducts: ProductsByShelf = {};

      // Initialiser chaque shelf avec un tableau vide
      sortedShelves.forEach(shelf => {
        organizedProducts[shelf.id] = [];
      });

      // Répartir les produits dans leurs shelves respectives
      productsData.forEach(product => {
        const shelfId = product.shelf.id;
        if (organizedProducts[shelfId]) {
          organizedProducts[shelfId].push(product);
        } else {
          organizedProducts[shelfId] = [product];
        }
      });


      setProductsByShelf(organizedProducts);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shop data');
      console.error('❌ [useProducerShopData] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authState.userInfo?.sub, params?.externalProducerKeycloakId]); // Dépendances stables

  // Fonction pour rafraîchir les données (utilise fetchData qui est stable)
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Charger les données au montage
  useEffect(() => {
    if (authState.isSignedIn && authState.userInfo?.sub) {
      fetchData();
    }
  }, [authState.isSignedIn, authState.userInfo?.sub, fetchData]);


  return {
    producerId,
    shelves,
    productsByShelf,
    allProducts,
    isLoading,
    error,
    refreshData,
  };
}

