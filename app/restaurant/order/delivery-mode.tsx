import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useCart } from "../../../components/CartContext";

interface DeliveryOption {
  id: string;
  titleKey: string;
  priceKey: string;
  price: number;
  isFree?: boolean;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'pickup',
    titleKey: 'delivery.pickup.title',
    priceKey: 'delivery.pickup.price',
    price: 0,
    isFree: true
  },
  {
    id: 'delivery',
    titleKey: 'delivery.delivery.title', 
    priceKey: 'delivery.delivery.price',
    price: 5.00
  }
];

export default function DeliveryModeScreen() {
  const { t } = useTranslation();
  const { state } = useCart();
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>('pickup');

  const handleBack = () => {
    router.back();
  };

  const handleConfirmOrder = () => {
    // Navigate to order confirmation page
    router.push('/restaurant/order/order-confirmation');
  };

  const getProducerName = (): string => {
    if (state.items.length > 0) {
      return state.items[0].producerName;
    }
    return "Producteur";
  };

  const getSelectedDeliveryPrice = (): number => {
    const selectedOption = deliveryOptions.find(option => option.id === selectedDeliveryMode);
    return selectedOption ? selectedOption.price : 0;
  };

  const getTotalWithDelivery = (): number => {
    return state.totalPrice + getSelectedDeliveryPrice();
  };

  const renderDeliveryOption = (option: DeliveryOption) => {
    const isSelected = selectedDeliveryMode === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.deliveryOption, isSelected && styles.deliveryOptionSelected]}
        onPress={() => setSelectedDeliveryMode(option.id)}
      >
        <View style={styles.optionContent}>
          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
          
          <View style={styles.optionIcon}>
            <Text style={styles.iconText}>
              {option.id === 'pickup' ? '📍' : '🚚'}
            </Text>
          </View>
          
          <View style={styles.optionDetails}>
            <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
            <Text style={styles.optionPrice}>
              {option.isFree 
                ? t(option.priceKey)
                : t(option.priceKey, { amount: option.price.toFixed(2) })
              }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('delivery.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.orderTitle}>
            {t('delivery.order_from', { producerName: getProducerName() })}
          </Text>
          <Text style={styles.orderTotal}>
            {t('delivery.total', { amount: getTotalWithDelivery().toFixed(2) })}
          </Text>
        </View>

        {/* Delivery Options */}
        <View style={styles.deliveryOptionsContainer}>
          {deliveryOptions.map(renderDeliveryOption)}
        </View>

        {/* Payment Note */}
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteText}>
            {t('delivery.payment_note')}
          </Text>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
          <Text style={styles.confirmButtonText}>
            {t('delivery.confirm_order')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6ED",
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center",
    paddingHorizontal: 19,
    paddingVertical: 21,
    backgroundColor: "#F7F6ED",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#4A4459",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Order summary
  orderSummary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    color: "#89A083",
    fontWeight: "500",
  },

  // Delivery options
  deliveryOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  deliveryOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  deliveryOptionSelected: {
    borderColor: "#89A083",
    backgroundColor: "#F8FBF8",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#89A083",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#89A083",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 14,
    color: "#89A083",
    fontWeight: "500",
  },

  // Payment note
  paymentNote: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  paymentNoteText: {
    fontSize: 14,
    color: "#4A4459",
    lineHeight: 20,
  },

  // Bottom section
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6", 
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#89A083",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.15,
  },
});
