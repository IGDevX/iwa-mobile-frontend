/**
 * useCertifications Hook
 *
 * Custom hook to fetch and manage product certifications from Shop Service
 */

import { useEffect, useState } from 'react';
import { getAllCertifications, type ProductCertificationResponse } from '../services/shop';

interface UseCertificationsReturn {
  certifications: ProductCertificationResponse[];
  isLoading: boolean;
  error: string | null;
  refreshCertifications: () => Promise<void>;
}

export function useCertifications(): UseCertificationsReturn {
  const [certifications, setCertifications] = useState<ProductCertificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching certifications...');
      const data = await getAllCertifications();
      console.log('✅ Certifications fetched:', data.length);
      setCertifications(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching certifications:', err);
      setError('Failed to load certifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const refreshCertifications = async () => {
    await fetchCertifications();
  };

  return {
    certifications,
    isLoading,
    error,
    refreshCertifications,
  };
}

