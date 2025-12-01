/**
 * Stripe Onboarding Refresh Page
 * 
 * This page handles expired onboarding links and provides a way to generate
 * new links for users who haven't completed their account setup.
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { refreshOnboardingLink } from '../../services/payment/stripeConnectService';

export default function StripeRefreshPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);

  // URLs should match your configuration
  const RETURN_URL = process.env.EXPO_PUBLIC_STRIPE_RETURN_URL || 'exp://127.0.0.1:8081/--/producer/stripe-return';
  const REFRESH_URL = process.env.EXPO_PUBLIC_STRIPE_REFRESH_URL || 'exp://127.0.0.1:8081/--/producer/stripe-refresh';

  const handleRefreshOnboarding = async () => {
    try {
      setLoading(true);
      
      const result = await refreshOnboardingLink(RETURN_URL, REFRESH_URL);
      
      if (result.onboardingUrl) {
        const canOpen = await Linking.canOpenURL(result.onboardingUrl);
        if (canOpen) {
          await Linking.openURL(result.onboardingUrl);
        } else {
          Alert.alert(
            t('stripe_connect.unable_to_open'),
            t('stripe_connect.manual_navigation_required'),
            [{ text: t('stripe_connect.ok') }]
          );
        }
      }
      
    } catch (error) {
      console.error('Failed to refresh onboarding link:', error);
      Alert.alert(
        t('stripe_connect.refresh_failed'),
        t('stripe_connect.refresh_error_message'),
        [{ text: t('stripe_connect.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.replace('/producer/home/dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏰</Text>
      <Text style={styles.title}>
        {t('stripe_connect.link_expired', 'Onboarding Link Expired')}
      </Text>
      <Text style={styles.description}>
        {t('stripe_connect.link_expired_message', 
          'Your Stripe onboarding link has expired. Generate a new link to continue setting up your payment account.')}
      </Text>
      
      <TouchableOpacity 
        style={[styles.primaryButton, loading && styles.disabledButton]} 
        onPress={handleRefreshOnboarding}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading 
            ? t('stripe_connect.generating_link', 'Generating New Link...') 
            : t('stripe_connect.generate_new_link', 'Generate New Link')
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToDashboard}>
        <Text style={styles.secondaryButtonText}>
          {t('stripe_connect.back_to_dashboard', 'Back to Dashboard')}
        </Text>
      </TouchableOpacity>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>
          {t('stripe_connect.why_expired', 'Why did my link expire?')}
        </Text>
        <Text style={styles.helpText}>
          {t('stripe_connect.expiration_explanation', 
            'Stripe onboarding links expire for security reasons. You can generate a new link at any time to continue your account setup.')}
        </Text>
      </View>
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
  icon: {
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
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    minWidth: 200,
    marginBottom: 32,
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
  helpSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxWidth: 300,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});