import React, { useContext, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useCart } from "../../../components/CartContext";
import { AuthContext } from "../../../components/AuthContext";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CartScreen() {
  const { t } = useTranslation();
  const { state, updateQuantity, removeItem } = useCart();
  const { state: authState } = useContext(AuthContext);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isSignedIn) {
      router.replace('../../profile/login');
    }
  }, [authState.isSignedIn]);

  const handleBack = () => {
    router.back();
  };

  const handleQuantityChange = (itemId: number, change: number) => {
    const currentItem = state.items.find(item => item.id === itemId);
    if (currentItem) {
      const newQuantity = Math.max(0, currentItem.quantity + change);
      if (newQuantity === 0) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  const handleNext = () => {
    // Navigate to delivery mode selection
    router.push('../order/delivery-mode');
  };

  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)}€`;
  };

  const getProducerInfo = () => {
    // For demo purposes, we'll show the first producer
    // In a real app, you might group items by producer
    if (state.items.length > 0) {
      return {
        name: state.items[0].producerName,
        type: "Maraîcher bio",
        image: "https://photo-cdn2.icons8.com/vVsONpHf7-sTgM9mNbSkmX0iCJP6YF9_Ux93NilJJkY/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA1L2NkNjhm/ODcwLWVjMmMtNDU2/OC1hNmE5LTk3ZGQw/NWE3Mjc3Mi5qcGc.webp"
      };
    }
    return null;
  };

  // Don't render anything if not authenticated - redirect will handle navigation
  if (!authState.isSignedIn) {
    return null;
  }

  const producerInfo = getProducerInfo();

  if (state.items.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color="#4A4459" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
          <View style={styles.menuButton} />
        </View>

        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>{t('cart.empty.title')}</Text>
          <TouchableOpacity style={styles.continueShoppingButton} onPress={handleBack}>
            <Text style={styles.continueShoppingText}>{t('cart.empty.continue_shopping')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color="#4A4459" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Producer Info */}
        {producerInfo && (
          <View style={styles.producerCard}>
            <View style={styles.producerInfo}>
              <Image source={{ uri: producerInfo.image }} style={styles.producerImage} />
              <View style={styles.producerDetails}>
                <Text style={styles.producerName}>{producerInfo.name}</Text>
                <Text style={styles.producerType}>{producerInfo.type}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.cartItems}>
          {state.items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemContent}>
                {/* Product Icon */}
                <View style={styles.productIcon}>
                   <Image source={{ uri: item.image }} style={styles.productImage} />
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  {/* Top Row: Name and Remove Button */}
                  <View style={styles.topRow}>
                    <View style={styles.productNameSection}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productCategory}>{item.category}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Row: Price and Quantity */}
                  <View style={styles.bottomRow}>
                    <View style={styles.priceSection}>
                      <Text style={styles.itemPrice}>{formatPrice(item.price)}/{item.unit}</Text>
                      <Text style={styles.itemSubtotal}>{t('cart.subtotal')} {formatPrice(item.subtotal)}</Text>
                    </View>

                    {/* Quantity Controls */}
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 250 }} />
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('cart.total_items')} ({state.totalItems} {t('cart.articles')})</Text>
            <Text style={styles.totalAmount}>{formatPrice(state.totalPrice)}</Text>
          </View>

          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>{t('cart.order_total')}</Text>
            <Text style={styles.finalTotalAmount}>{formatPrice(state.totalPrice)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('cart.next')}</Text>
        </TouchableOpacity>

        <Text style={styles.deliveryNote}>
          {t('cart.delivery_note')}
        </Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6ED",
    paddingTop: 40,
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
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonIcon: {
    width: 20,
    height: 20
  },
  backButtonText: {
    fontSize: 20,
    color: "#4A4459",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 27,
    color: '#4A4459',
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },

  // Producer card
  producerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  producerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  producerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  producerDetails: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 4,
  },
  producerType: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.7)",
  },

  // Cart items
  cartItems: {
    gap: 12,
  },
  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  itemContent: {
    flexDirection: "row",
    gap: 12,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productEmoji: {
    fontSize: 30,
    letterSpacing: 0.4,
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productNameSection: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: "rgba(74, 68, 89, 0.7)",
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: 20,
    color: "rgba(74, 68, 89, 0.5)",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceSection: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#89A083",
    marginBottom: 4,
  },
  itemSubtotal: {
    fontSize: 16,
    color: "#4A4459",
  },

  // Quantity controls
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
  quantityText: {
    fontSize: 14,
    color: "#4A4459",
    fontWeight: "500",
    width: 20,
    textAlign: "center",
  },

  // Bottom section
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 40,
    gap: 16,
  },
  totalSection: {
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.7)",
  },
  totalAmount: {
    fontSize: 14,
    color: "#4A4459",
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalTotalLabel: {
    fontSize: 18,
    color: "#4A4459",
  },
  finalTotalAmount: {
    fontSize: 20,
    fontWeight: "500",
    color: "#89A083",
  },
  nextButton: {
    backgroundColor: "#89A083",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: -0.15,
  },
  deliveryNote: {
    fontSize: 12,
    color: "rgba(74, 68, 89, 0.7)",
    textAlign: "center",
  },

  // Empty cart
  emptyCart: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#4A4459",
    textAlign: "center",
  },
  continueShoppingButton: {
    backgroundColor: "#89A083",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  continueShoppingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
