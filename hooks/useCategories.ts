/**
 * useCategories Hook
 *
 * Custom hook to fetch and manage product categories from Shop Service
 */

import { useEffect, useState } from 'react';
import { getAllCategories, type CategoryResponse } from '../services/shop';
import { getCategoryIcon } from '../constants/CategoryIcons';

export interface CategoryWithIcon extends CategoryResponse {
  icon: any;
}

interface UseCategoriesReturn {
  categories: CategoryWithIcon[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching categories...');
      const data = await getAllCategories();
      console.log('✅ Categories fetched:', data.length);

      // Sort by displayOrder and add icons
      const categoriesWithIcons = data
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(category => {
          const icon = getCategoryIcon(category.slug);
          console.log(`📦 Category: ${category.name} (${category.slug}) - Icon:`, icon);
          return {
            ...category,
            icon,
          };
        });

      setCategories(categoriesWithIcons);
      setError(null);
      console.log('✅ Categories set:', categoriesWithIcons.length);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  return {
    categories,
    isLoading,
    error,
    refreshCategories,
  };
}

