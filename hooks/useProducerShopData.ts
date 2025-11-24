/**
 * useProducerShopData Hook
 *
 * Hook personnalisé pour gérer les données de la boutique d'un producteur
 * Récupère les shelves et les produits organisés par shelf
 */

import { useContext, useEffect, useState } from 'react';
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

export function useProducerShopData(): UseProducerShopDataReturn {
  const { state: authState } = useContext(AuthContext);
  const [producerId, setProducerId] = useState<number | null>(null);
  const [shelves, setShelves] = useState<ShelfResponse[]>([]);
  const [productsByShelf, setProductsByShelf] = useState<ProductsByShelf>({});
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Récupérer le Producer ID depuis le Keycloak ID
      const keycloakId = authState.userInfo?.sub;
      if (!keycloakId) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 [PRODUCER SHOP] Fetching producer ID for keycloakId:', keycloakId);
      const profile = await getUserByKeycloakId(keycloakId);
      const fetchedProducerId = profile.id;
      setProducerId(fetchedProducerId);
      console.log('✅ [PRODUCER SHOP] Producer ID:', fetchedProducerId);

      // 2. Récupérer les shelves du producteur
      console.log('🔄 [PRODUCER SHOP] Fetching shelves for producer:', fetchedProducerId);
      const shelvesData = await getShelvesByProducer(fetchedProducerId);

      // Normaliser les shelves pour ajouter name depuis label si nécessaire
      const normalizedShelves = shelvesData.map(shelf => ({
        ...shelf,
        name: shelf.name || shelf.label, // Utiliser label si name n'existe pas
      }));

      // Trier les shelves par displayOrder si disponible, sinon par id
      const sortedShelves = normalizedShelves.sort((a, b) =>
        (a.displayOrder || a.id) - (b.displayOrder || b.id)
      );
      setShelves(sortedShelves);
      console.log('✅ [PRODUCER SHOP] Shelves loaded:', sortedShelves.length);

      // 3. Récupérer tous les produits du producteur
      console.log('🔄 [PRODUCER SHOP] Fetching products for producer:', fetchedProducerId);
      console.log('📍 [PRODUCER SHOP] Using endpoint:', `GET /shop/products/producer/${fetchedProducerId}`);
      const productsData = await getProductsByProducer(fetchedProducerId);
      setAllProducts(productsData);
      console.log('✅ [PRODUCER SHOP] Products loaded:', productsData.length);

      if (productsData.length > 0) {
        console.log('📦 [PRODUCER SHOP] Sample product:', {
          id: productsData[0].id,
          title: productsData[0].title,
          shelf: productsData[0].shelf.label,
        });
      }

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
          // Si le shelf n'existe pas dans notre liste, on le crée
          organizedProducts[shelfId] = [product];
        }
      });

      setProductsByShelf(organizedProducts);
      console.log('✅ [PRODUCER SHOP] Products organized by shelf');

    } catch (err) {
      console.error('❌ [PRODUCER SHOP] Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shop data');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (authState.isSignedIn && authState.userInfo?.sub) {
      fetchData();
    }
  }, [authState.isSignedIn, authState.userInfo?.sub]);

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    await fetchData();
  };

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

