/**
 * Producer Payment Setup Screen
 * 
 * Screen for managing Stripe Connect payment setup
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StripeConnectComponent } from '../../components/StripeConnectComponent';
import { useStripeConnect } from '../../hooks/useStripeConnect';

export default function ProducerPaymentSetup() {
  const { t } = useTranslation();
  const { loadAccountInfo } = useStripeConnect();
  
  // Reload account info when page comes into focus (e.g., after returning from Stripe)
  useFocusEffect(
    useCallback(() => {
      loadAccountInfo();
    }, [loadAccountInfo])
  );
  
  // Configure URLs from environment variables (with fallbacks for development)
  const RETURN_URL = process.env.EXPO_PUBLIC_STRIPE_RETURN_URL || 'exp://127.0.0.1:8081/--/producer/stripe-return';
  const REFRESH_URL = process.env.EXPO_PUBLIC_STRIPE_REFRESH_URL || 'exp://127.0.0.1:8081/--/producer/stripe-refresh';

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color="#4A4459" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('stripe_connect.payment_setup_title')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('stripe_connect.why_need_this')}</Text>
        </View>
        <Text style={styles.infoText}>
          {t('stripe_connect.benefits')}
        </Text>
      </View>

      {/* Stripe Connect Component */}
      <View style={styles.section_payment}>
        <StripeConnectComponent
          returnUrl={RETURN_URL}
          refreshUrl={REFRESH_URL}
          showAdvancedOptions={true}
        />
      </View>

      {/* Support Section */}
      <View style={{...styles.section, marginBottom: 92}}>
        <View style={styles.supportHeader}>
          <Ionicons name="help-circle-outline" size={20} color="#89A083" />
          <Text style={styles.supportTitle}>{t('stripe_connect.need_help')}</Text>
        </View>
        <Text style={styles.supportText}>
          {t('stripe_connect.support_message')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6ed',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    color: '#4A4459',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginHorizontal: 24,
    backgroundColor: '#eae9e1',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
    section_payment: {
    marginHorizontal: 24,
    marginBottom: 16
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 24,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 21,
    opacity: 0.8,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 24,
    fontWeight: '700',
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 21,
    opacity: 0.8,
  },
});