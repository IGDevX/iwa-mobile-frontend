import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { PAYMENT_CONFIG } from '../services/payment/paymentConfig';
import { createPaymentIntent } from '../services/payment/paymentService';

interface UsePaymentOptions {
  amount: number; // Amount in cents
  currency?: string;
  merchantDisplayName?: string;
  producerKeycloakId?: string; // For connected account payments
  orderId?: string; // For tracking the order
  stripeAccountId: string,
  platformFeePercentage?: number; // Optional custom platform fee percentage
}

export const usePayment = (options: UsePaymentOptions) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const {
    amount,
    currency = PAYMENT_CONFIG.DEFAULT_CURRENCY,
    merchantDisplayName = 'Your Business',
    producerKeycloakId,

    orderId,
    platformFeePercentage = PAYMENT_CONFIG.PLATFORM_FEE_PERCENTAGE,
  } = options;

  const fetchPaymentSheetParams = async () => {
    try {
      // Calculate platform fee if this is a connected account payment
      const applicationFeeAmount = producerKeycloakId 
        ? Math.round(amount * (platformFeePercentage / 100))
        : undefined;

      const response = await createPaymentIntent({
        amount,
        currency,
        producerKeycloakId,
        orderId,
        applicationFeeAmount,
      });
      
      // Store the payment intent ID
      setPaymentIntentId(response.paymentIntentId);
      return response.clientSecret;
    } catch (error: any) {
      console.error('[usePayment] Failed to create payment intent:', error);
      // Re-throw with more context
      const errorMessage = error.message || 'Failed to connect to payment service';
      throw new Error(errorMessage);
    }
  };

  const openPaymentSheet = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create payment intent
      const clientSecret = await fetchPaymentSheetParams();

      if (!clientSecret) {
        throw new Error('No client secret received from payment service');
      }

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName,
        paymentIntentClientSecret: clientSecret,
        returnURL: 'expoapp://stripe-redirect',
        defaultBillingDetails: {
          name: merchantDisplayName,
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        console.log('initError raw:', initError);
        console.error('Type:', typeof initError);
        Alert.alert('Payment Setup Error', initError.message || 'Failed to initialize payment');
        return { success: false, error: initError.message };
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false, canceled: true };
        } else {
          console.error('[usePayment] Payment error:', presentError);
          Alert.alert('Payment Error', presentError.message || 'Payment failed');
          return { success: false, error: presentError.message };
        }
      }
      return { success: true, paymentIntentId };

    } catch (error: any) {
      console.error('[usePayment] Unexpected payment error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.alert('Payment Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    openPaymentSheet,
  };
};
