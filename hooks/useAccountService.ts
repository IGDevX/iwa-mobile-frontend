/**
 * useAccountService Hook
 * 
 * React hook for managing account service operations, including:
 * - Initializing token provider for authenticated requests
 * - Retrying pending notifications on app startup
 * - Providing helper functions for account operations
 */

import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/AuthContext';
import {
    ensureProducerProfileExists,
    ensureRestaurantProfileExists,
    getMyProfile,
    type ProducerProfileRequest,
    type RestaurantProfileRequest,
    type UserProfileResponse,
} from '../services/account';
import { setTokenProvider } from '../services/shared/httpClient';
import { getPendingNotificationCount, retryPendingNotifications } from '../services/shared/retryQueue';

export function useAccountService() {
  const { state } = useContext(AuthContext);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Initialize token provider when auth state changes
  useEffect(() => {
    setTokenProvider(async () => {
      return state.accessToken;
    });
  }, [state.accessToken]);

  // Retry pending notifications on mount and when coming online
  useEffect(() => {
    const retryPending = async () => {
      if (isRetrying) return;
      
      setIsRetrying(true);
      try {
        const result = await retryPendingNotifications();
        console.log('Retry result:', result);
        
        // Update pending count
        const count = await getPendingNotificationCount();
        setPendingCount(count);
      } catch (error) {
        console.error('Failed to retry pending notifications:', error);
      } finally {
        setIsRetrying(false);
      }
    };

    // Retry on mount
    retryPending();

    // Optional: Listen for network state changes (requires expo-network or similar)
    // You can add network listeners here if needed
  }, []);

  // Manually trigger retry
  const manualRetry = useCallback(async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      const result = await retryPendingNotifications();
      const count = await getPendingNotificationCount();
      setPendingCount(count);
      return result;
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying]);

  // Ensure producer profile exists (idempotent)
  const ensureProducerProfile = useCallback(
    async (keycloakId: string, request: ProducerProfileRequest): Promise<UserProfileResponse> => {
      const result = await ensureProducerProfileExists(keycloakId, request);
      
      // Update pending count after operation
      const count = await getPendingNotificationCount();
      setPendingCount(count);
      
      return result;
    },
    []
  );

  // Ensure restaurant profile exists (idempotent)
  const ensureRestaurantProfile = useCallback(
    async (keycloakId: string, request: RestaurantProfileRequest): Promise<UserProfileResponse> => {
      const result = await ensureRestaurantProfileExists(keycloakId, request);
      
      // Update pending count after operation
      const count = await getPendingNotificationCount();
      setPendingCount(count);
      
      return result;
    },
    []
  );

  // Get current user's profile
  const fetchMyProfile = useCallback(async (): Promise<UserProfileResponse> => {
    return getMyProfile();
  }, []);

  return {
    pendingCount,
    isRetrying,
    manualRetry,
    ensureProducerProfile,
    ensureRestaurantProfile,
    fetchMyProfile,
  };
}
