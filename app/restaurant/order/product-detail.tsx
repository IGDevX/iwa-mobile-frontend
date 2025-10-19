import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../../components/CartContext";
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock producer data
const mockProducer = {
  name: "Ferme Bio Laurent",
  type: "Maraîcher bio",
  rating: 4.8,
  address: "123 Route de Montpellier, 34000",
  badges: ["Bio", "Local", "Éco-responsable"],
  image: "https://photo-cdn2.icons8.com/vVsONpHf7-sTgM9mNbSkmX0iCJP6YF9_Ux93NilJJkY/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA1L2NkNjhm/ODcwLWVjMmMtNDU2/OC1hNmE5LTk3ZGQw/NWE3Mjc3Mi5qcGc.webp"
};

// Mock product data (this would normally come from navigation params)
const mockProductDetails = {
  id: 1,
  name: "Tomates bio",
  price: 3.50, // Price as number for calculations
  priceDisplay: "3.50€/kg",
  unit: "kg",
  category: "Légumes",
  emoji: "🍅",
  description: "Tomates bio cultivées localement dans notre ferme. Variété ancienne, goût authentique et savoureux. Idéales pour vos préparations culinaires.",
  characteristicKeys: [
    "product.agriculture_bio",
    "product.no_pesticides",
    "product.heritage_variety",
    "product.daily_harvest"
  ],
  image: "https://photo-cdn2.icons8.com/6-T_VL6CNAS2Ye_pJTjt3Ng2XCJizRvKF6QbAJQCif4/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTU5L2NlNjZj/YTIxLTE4MmItNGI0/My1hMzY1LTI0YjA0/M2EyYjI5My5qcGc.webp"
};

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { addItem, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Get current quantity in cart for this product
  const cartQuantity = getItemQuantity(mockProductDetails.id);

  const handleBack = () => {
    router.back();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    // Add to cart using CartContext
    addItem({
      id: mockProductDetails.id,
      name: mockProductDetails.name,
      price: mockProductDetails.price,
      unit: mockProductDetails.unit,
      quantity: quantity,
      category: mockProductDetails.category,
      image: mockProductDetails.image,
      producerId: 1,
      producerName: mockProducer.name
    });

  };

  const handleViewShop = () => {
    // Navigate to producer's shop
    router.push({
      pathname: '/producer/home/producer-shop',
      params: {
        producerId: 1,
        producerName: mockProducer.name
      }
    });
  };

  const handleCartPress = () => {
    router.push('/restaurant/order/cart');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color="#4A4459" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Image
            source={require('../../../assets/images/icons8-cart-96.png')}
            style={styles.cartIcon}
          />
          {cartQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: mockProductDetails.image }} style={styles.productImage} />
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>{mockProductDetails.name}</Text>

          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.price}>{mockProductDetails.priceDisplay}</Text>
            </View>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.description')}</Text>
            <Text style={styles.description}>{mockProductDetails.description}</Text>
          </View>

          {/* Characteristics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.characteristics')}</Text>
            {mockProductDetails.characteristicKeys.map((charKey, index) => (
              <View key={index} style={styles.characteristicItem}>
                <View style={styles.bullet} />
                <Text style={styles.characteristicText}>{t(charKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Producer Card */}
        <View style={styles.producerCard}>
          <Text style={styles.producerTitle}>{t('product.producer_section')}</Text>

          <View style={styles.producerInfo}>
            <Image source={{ uri: mockProducer.image }} style={styles.producerImage} />

            <View style={styles.producerDetails}>
              <Text style={styles.producerName}>{mockProducer.name}</Text>
              <Text style={styles.producerType}>{mockProducer.type}</Text>

              <View style={styles.ratingContainer}>
                <Image source={require('../../../assets/images/icons8-star-96.png')} style={styles.ratingIcon} />
                <Text style={styles.rating}>{mockProducer.rating}</Text>
              </View>

              <View style={styles.addressContainer}>
                <Image source={require('../../../assets/images/icons8-map-pin-96.png')} style={styles.ratingIcon} />
                <Text style={styles.address}>{mockProducer.address}</Text>
              </View>

              <View style={styles.badgesContainer}>
                {mockProducer.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.shopButton} onPress={handleViewShop}>
            <Text style={styles.shopButtonText}>{t('product.view_shop')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Cart Section */}
      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('product.total')} ({quantity} {mockProductDetails.unit})</Text>
          <Text style={styles.totalPrice}>{(mockProductDetails.price * quantity).toFixed(2)}€</Text>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>
            {t('product.add_to_cart')}
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
    paddingTop: 40
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
  shareButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    fontSize: 20,
    color: "#4A4459",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartIcon: {
    width: 30,
    height: 30,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#b55d62ff",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  // Product image
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    borderRadius: 20,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Product card styles
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceInfo: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: "500",
    color: "#89A083",
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.7)",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#4A4459",
    fontWeight: "500",
  },
  quantityText: {
    fontSize: 18,
    color: "#4A4459",
    fontWeight: "500",
    width: 30,
    textAlign: "center",
  },

  // Section styles
  section: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 17,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4A4459",
    lineHeight: 22.75,
    marginBottom: 16,
  },
  characteristicItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#89A083",
  },
  characteristicText: {
    fontSize: 14,
    color: "#4A4459",
    lineHeight: 21,
  },

  // Producer card styles
  producerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginTop: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  producerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 16,
  },
  producerInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  producerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingIcon: {
    width: 16,
    height: 16
  },
  rating: {
    fontSize: 14,
    color: "#4A4459",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  addressIcon: {
    fontSize: 12,
    opacity: 0.7,
  },
  address: {
    fontSize: 12,
    color: "rgba(74, 68, 89, 0.7)",
    flex: 1,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#89A083",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: 0.12,
  },
  shopButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#89A083",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  shopButtonText: {
    fontSize: 14,
    color: "#89A083",
    fontWeight: "500",
    letterSpacing: -0.15,
  },

  // Bottom section styles
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  totalContainer: {
    marginBottom: 16,
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.7)",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    color: "#89A083",
    fontWeight: "500",
  },
  addToCartButton: {
    backgroundColor: "#89A083",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  addToCartIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  addToCartText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: -0.15,
  },
});