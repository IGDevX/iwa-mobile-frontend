/**
 * Payment Status Card Component
 * 
 * Compact component showing payment account status and quick access to settings
 * Can be used in dashboard, profile, or settings screens
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useStripeConnect } from '../hooks/useStripeConnect';

interface PaymentStatusCardProps {
  /**
   * Show as compact card (for dashboard) or expanded (for settings)
   */
  compact?: boolean;

  /**
   * Custom styling
   */
  style?: any;
}

export function PaymentStatusCard({ compact = false, style }: PaymentStatusCardProps) {
  const { t } = useTranslation();
  const { account, loading, isReady, statusMessage } = useStripeConnect();

  const handleSetupPayments = () => {
    router.push('/producer/payment-setup');
  };

  const handleViewDetails = () => {
    router.push('/producer/payment-setup');
  };

  const getStatusColor = () => {
    if (!account) return '#9F2D00'; // Orange for warning
    switch (account.accountStatus) {
      case 'active': return '#016630'; // Green for success
      case 'pending': return '#9F2D00'; // Orange for warning  
      case 'incomplete': return '#9F2D00'; // Orange for warning
      case 'rejected': return '#9F0712'; // Red for error
      default: return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    if (loading) return 'time-outline';
    if (!account) return 'card-outline';
    switch (account.accountStatus) {
      case 'active': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'incomplete': return 'alert-circle-outline';
      case 'rejected': return 'close-circle';
      default: return 'help-circle-outline';
    }
  };

  const getActionButton = () => {
    if (loading) return null;

    if (!account) {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleSetupPayments}>
          <Text style={styles.primaryButtonText}>
            {t('stripe_connect.enable_payments', 'Enable Payments')}
          </Text>
        </TouchableOpacity>
      );
    }

    if (!account.onboardingComplete) {
      return (
        <TouchableOpacity style={styles.warningButton} onPress={handleSetupPayments}>
          <Text style={styles.warningButtonText}>
            {t('stripe_connect.complete_setup', 'Complete Setup')}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.managePaymentsButton} onPress={handleViewDetails}>
        <Text style={styles.managePaymentsButtonText}>
          {t('stripe_connect.manage_payments', 'Manage Payments')}
        </Text>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, style]}
        onPress={account ? handleViewDetails : handleSetupPayments}
      >
        <View style={styles.compactHeader}>
          <View style={styles.compactIconContainer}>
            <Ionicons
              name={getStatusIcon()}
              size={24}
              color={getStatusColor()}
            />
          </View>
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle}>
              {t('stripe_connect.payments', 'Payments')}
            </Text>
            <Text style={[styles.compactStatus, { color: getStatusColor() }]}>
              {loading ? t('stripe_connect.loading', 'Loading...') : statusMessage}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.expandedCard, style]}>
      <View style={styles.expandedHeader}>
        <View style={styles.expandedTitleRow}>
          <Ionicons
            name={getStatusIcon()}
            size={28}
            color={getStatusColor()}
          />
          <View style={styles.expandedTitleContainer}>
            <Text style={styles.expandedTitle}>
              {t('stripe_connect.payment_account', 'Payment Account')}
            </Text>
            <Text style={[styles.expandedStatus, { color: getStatusColor() }]}>
              {loading ? t('stripe_connect.loading', 'Loading...') : statusMessage}
            </Text>
          </View>
        </View>

        {account && (
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>
              {t('stripe_connect.account_id', 'Account ID')}:
            </Text>
            <Text style={styles.accountValue}>
              {account.stripeAccountId}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.expandedActions}>
        {getActionButton()}
      </View>

      {!account && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            {t('stripe_connect.setup_info',
              'Set up your payment account to receive payments from restaurants.')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact styles (for dashboard)
  compactCard: {
    backgroundColor: '#eae9e1',
    borderRadius: 15,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7f6ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4459',
    marginBottom: 2,
  },
  compactStatus: {
    fontSize: 14,
  },

  // Expanded styles (for settings)
  expandedCard: {
    backgroundColor: '#eae9e1',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  expandedHeader: {
    marginBottom: 16,
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandedTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4459',
    marginBottom: 4,
  },
  expandedStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountInfo: {
    backgroundColor: '#f7f6ed',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  accountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#4a4459',
  },

  // Action buttons
  expandedActions: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#89a083',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fffef4',
    fontSize: 16,
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  warningButtonText: {
    color: '#fffef4',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#89a083',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#89a083',
    fontSize: 16,
    fontWeight: '600',
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f6ed',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#89a083',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4a4459',
    lineHeight: 20,
  },
  managePaymentsButton: {
    height: 37,
    borderRadius: 10,
    backgroundColor: '#89a083',
    justifyContent: 'center',
    alignItems: 'center',
  },
  managePaymentsButtonText: {
    fontSize: 14,
    color: '#fffef4',
    lineHeight: 21,
  },
});