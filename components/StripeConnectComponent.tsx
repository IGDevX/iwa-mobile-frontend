/**
 * Stripe Connect Component
 * 
 * React Native component for managing Stripe connected account
 * Can be used in producer profile, settings, or dedicated payment setup screen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useStripeConnect } from '../hooks/useStripeConnect';

interface StripeConnectComponentProps {
  /**
   * Callback when account setup is completed
   */
  onAccountSetupComplete?: (accountId: string) => void;
  
  /**
   * Return URL after onboarding completion
   */
  returnUrl: string;
  
  /**
   * Refresh URL for expired onboarding links
   */
  refreshUrl: string;
  
  /**
   * Custom styling
   */
  style?: any;
  
  /**
   * Show advanced options (delete, sync)
   */
  showAdvancedOptions?: boolean;
}

export function StripeConnectComponent({
  onAccountSetupComplete,
  returnUrl,
  refreshUrl,
  style,
  showAdvancedOptions = false
}: StripeConnectComponentProps) {
  const { t } = useTranslation();
  const {
    account,
    loading,
    error,
    isReady,
    statusMessage,
    createAccount,
    refreshOnboarding,
    syncStatus,
    deleteAccount,
    clearError
  } = useStripeConnect();

  /**
   * Handle account creation
   */
  const handleCreateAccount = async () => {
    await createAccount(returnUrl, refreshUrl);
  };

  /**
   * Handle onboarding refresh
   */
  const handleRefreshOnboarding = async () => {
    await refreshOnboarding(returnUrl, refreshUrl);
  };

  /**
   * Handle onboarding completion check
   */
  React.useEffect(() => {
    if (isReady && account && onAccountSetupComplete) {
      onAccountSetupComplete(account.stripeAccountId);
    }
  }, [isReady, account, onAccountSetupComplete]);

  /**
   * Show error alert
   */
  React.useEffect(() => {
    if (error) {
      Alert.alert(
        t('stripe_connect.payment_setup_error'),
        error,
        [
          { text: t('stripe_connect.ok'), onPress: clearError }
        ]
      );
    }
  }, [error, clearError, t]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('stripe_connect.setting_up')}</Text>
      </View>
    );
  }

  // No account exists - show setup option
  if (!account) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('stripe_connect.setup_payments')}</Text>
          <Text style={styles.subtitle}>
            {t('stripe_connect.setup_description')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {t('stripe_connect.create_payment_account')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Account exists but setup incomplete
  if (!account.onboardingComplete) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('stripe_connect.complete_setup')}</Text>
          <Text style={styles.subtitle}>
            {t('stripe_connect.complete_setup_description')}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{t('stripe_connect.status')}: {statusMessage}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRefreshOnboarding}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {t('stripe_connect.complete_setup_button')}
          </Text>
        </TouchableOpacity>

        {showAdvancedOptions && (
          <View style={styles.advancedOptions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={syncStatus}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>
                {t('stripe_connect.sync_status')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Account is ready
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('stripe_connect.payment_account_active')}</Text>
          {showAdvancedOptions && (
            <View style={styles.refreshContainer}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={syncStatus}
                disabled={loading}
              >
                <Ionicons name="refresh" size={24} color="#89a083"  />
              </TouchableOpacity>
              <Text style={styles.refreshHint}>{t('stripe_connect.sync_status')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>
          {t('stripe_connect.account_ready_description')}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('stripe_connect.status')}:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{t('stripe_connect.active')}</Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('stripe_connect.account_id')}:</Text>
          <Text style={styles.statusValue}>{account.stripeAccountId}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{t('stripe_connect.status')}:</Text>
          <Text style={[
            styles.statusValue,
            account.accountStatus === 'active' && styles.statusEnabled
          ]}>
            {account.accountStatus.charAt(0).toUpperCase() + account.accountStatus.slice(1)}
          </Text>
        </View>
      </View>



      {showAdvancedOptions && (
        <View style={styles.advancedOptions}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={deleteAccount}
            disabled={loading}
          >
            <Text style={styles.dangerButtonText}>
              {t('stripe_connect.delete_account')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#eae9e1',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a4459',
    flex: 1,
  },
  refreshContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a7a69d1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshHint: {
    fontSize: 10,
    color: '#4a4459',
    opacity: 0.6,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#4a4459',
    opacity: 0.7,
    lineHeight: 20,
  },
  statusContainer: {
    backgroundColor: '#f7f6ed',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#4a4459',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#4a4459',
    opacity: 0.7,
  },
  statusValue: {
    fontSize: 14,
    color: '#4a4459',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#016630',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusEnabled: {
    color: '#016630',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#89a083',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#fffef4',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 6,
    height: 37,
    backgroundColor: '#89a083',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#fffef4',
    lineHeight: 21,
  },
  dangerButton: {
    marginTop: 6,
    height: 37,
    backgroundColor: '#c2295aff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 14,
    color: '#fffef4',
    lineHeight: 21,
  },
  advancedOptions: {
    marginTop: 5,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4a4459',
    opacity: 0.7,
  },
});