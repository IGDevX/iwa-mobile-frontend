/**
 * Stripe Connect Hook
 * 
 * React hook for managing Stripe connected account state and operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';
import {
    ConnectedAccountStatusResponse,
    StripeConnectError,
    createConnectedAccount,
    deleteConnectedAccount,
    getAccountStatusMessage,
    getConnectedAccount,
    isAccountReadyForPayments,
    refreshOnboardingLink,
    syncAccountStatus
} from '../services/payment/stripeConnectService';

export interface UseStripeConnectResult {
  // State
  account: ConnectedAccountStatusResponse | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  statusMessage: string;

  // Actions
  createAccount: (returnUrl: string, refreshUrl: string) => Promise<void>;
  refreshOnboarding: (returnUrl: string, refreshUrl: string) => Promise<void>;
  syncStatus: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loadAccountInfo: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing Stripe Connect functionality
 */
export function useStripeConnect(): UseStripeConnectResult {
  const { t } = useTranslation();
  const [account, setAccount] = useState<ConnectedAccountStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load account information from backend
   */
  const loadAccountInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accountInfo = await getConnectedAccount();
      setAccount(accountInfo);
    } catch (err) {
      if (err instanceof StripeConnectError) {
        // Return null for 400/404 status codes (no account found)
        if (err.statusCode === 400 || err.statusCode === 404) {
          setAccount(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load account information');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new connected account
   */
  const createAccount = useCallback(async (returnUrl: string, refreshUrl: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createConnectedAccount(returnUrl, refreshUrl);

      // Open onboarding URL if provided
      if (result.onboardingUrl) {
        const canOpen = await Linking.canOpenURL(result.onboardingUrl);
        if (canOpen) {
          await Linking.openURL(result.onboardingUrl);
        } else {
          Alert.alert(
            t('stripe_connect.setup_required'),
            t('stripe_connect.complete_setup_message'),
            [{ text: t('stripe_connect.ok') }]
          );
        }
      }

      // Reload account status after creation
      setTimeout(() => loadAccountInfo(), 1000);
    } catch (err) {
      const errorMessage = err instanceof StripeConnectError 
        ? err.message 
        : t('stripe_connect.create_payment_account');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  /**
   * Refresh onboarding link for incomplete accounts
   */
  const refreshOnboarding = useCallback(async (returnUrl: string, refreshUrl: string) => {
    if (!account || account.onboardingComplete) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await refreshOnboardingLink(returnUrl, refreshUrl);

      // Open onboarding URL
      if (result.onboardingUrl) {
        const canOpen = await Linking.canOpenURL(result.onboardingUrl);
        if (canOpen) {
          await Linking.openURL(result.onboardingUrl);
        } else {
          Alert.alert(
            t('stripe_connect.setup_required'),
            t('stripe_connect.complete_setup_message'),
            [{ text: t('stripe_connect.ok') }]
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof StripeConnectError 
        ? err.message 
        : t('stripe_connect.complete_setup_button');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, t]);

  /**
   * Sync account status from Stripe
   */
  const syncStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Trigger sync on backend
      await syncAccountStatus();
      
      // Reload full account information after sync
      await loadAccountInfo();
      
      Alert.alert(
        t('stripe_connect.sync_complete', 'Sync Complete'),
        t('stripe_connect.sync_complete_message', 'Your payment account status has been updated.'),
        [{ text: t('stripe_connect.ok') }]
      );
    } catch (err) {
      const errorMessage = err instanceof StripeConnectError 
        ? err.message 
        : 'Failed to sync account status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadAccountInfo, t]);

  /**
   * Delete connected account
   */
  const deleteAccount = useCallback(async () => {
    Alert.alert(
      t('stripe_connect.delete_payment_account'),
      t('stripe_connect.delete_confirmation'),
      [
        { text: t('stripe_connect.cancel'), style: 'cancel' },
        {
          text: t('stripe_connect.delete'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);

            try {
              await deleteConnectedAccount();
              setAccount(null);
            } catch (err) {
              const errorMessage = err instanceof StripeConnectError 
                ? err.message 
                : t('stripe_connect.delete_account');
              setError(errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }, [t]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load account info on mount
   */
  useEffect(() => {
    loadAccountInfo();
  }, [loadAccountInfo]);

  // Derived state
  const isReady = isAccountReadyForPayments(account);
  const statusMessage = getAccountStatusMessage(account);

  return {
    // State
    account,
    loading,
    error,
    isReady,
    statusMessage,

    // Actions
    createAccount,
    refreshOnboarding,
    syncStatus,
    deleteAccount,
    loadAccountInfo,
    clearError,
  };
}