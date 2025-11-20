/**
 * Stripe Onboarding Return Page
 * 
 * This page handles the return flow after Stripe onboarding completion.
 * Users are redirected here from Stripe after completing account setup.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { syncAccountStatus } from '../../services/payment/stripeConnectService';

export default function StripeReturnPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleReturnFromStripe();
  }, []);

  const handleReturnFromStripe = async () => {
    try {
      setLoading(true);
      
      // Sync account status from Stripe to get the latest information
      await syncAccountStatus();
      
      setSuccess(true);
      setError(null);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.replace('/producer/home/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Failed to sync account status:', err);
      setError(t('stripe_connect.sync_failed', 'Failed to update account status'));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySync = () => {
    handleReturnFromStripe();
  };

  const handleContinueToDashboard = () => {
    router.replace('/producer/home/dashboard');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.title}>
          {t('stripe_connect.updating_account', 'Updating Account Status...')}
        </Text>
        <Text style={styles.description}>
          {t('stripe_connect.please_wait', 'Please wait while we update your account information.')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.title}>
          {t('stripe_connect.update_failed', 'Update Failed')}
        </Text>
        <Text style={styles.description}>
          {error}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleRetrySync}>
          <Text style={styles.buttonText}>
            {t('stripe_connect.retry', 'Retry')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueToDashboard}>
          <Text style={styles.secondaryButtonText}>
            {t('stripe_connect.continue_to_dashboard', 'Continue to Dashboard')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.title}>
        {t('stripe_connect.setup_complete', 'Payment Setup Complete!')}
      </Text>
      <Text style={styles.description}>
        {t('stripe_connect.setup_success_message', 
          'Your Stripe account has been successfully set up. You can now receive payments from customers.')}
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToDashboard}>
        <Text style={styles.buttonText}>
          {t('stripe_connect.continue_to_dashboard', 'Continue to Dashboard')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});