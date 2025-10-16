import React from "react";
import { Text, Image, StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../../components/CartContext";

// Mock producer data
const mockProducer = {
  name: "Ferme Bio Laurent",
  responsibleName: "Nom responsable",
  description: "Ferme responsable située à Loupian. Large variété de fruits et légumes issues de l'agriculture biologique.",
  bannerImage: "https://placehold.co/430x120/89A083/FFFFFF?text=Ferme+Bio",
  profileImage: "https://placehold.co/80x80/89A083/FFFFFF?text=FB"
};

// Mock products data organized by category
const mockProducts = {
  "Légumes": [
    {
      id: 1,
      name: "Tomates",
      emoji: "🍅",
      price: 3.50,
      priceDisplay: "3.50€/kg",
      unit: "kg",
      stock: "Stock: 10 kg",
      category: "Légumes"
    },
    {
      id: 2,
      name: "Carottes",
      emoji: "🥕",
      price: 2.20,
      priceDisplay: "2.20€/kg", 
      unit: "kg",
      stock: "Stock: 8 kg",
      category: "Légumes"
    }
  ],
  "Fruits": [
    {
      id: 3,
      name: "Pommes",
      emoji: "🍎",
      price: 2.80,
      priceDisplay: "2.80€/kg",
      unit: "kg",
      stock: "Stock: 15 kg",
      category: "Fruits"
    },
    {
      id: 4,
      name: "Poires",
      emoji: "🍐",
      price: 3.20,
      priceDisplay: "3.20€/kg",
      unit: "kg",
      stock: "Stock: 6 kg",
      category: "Fruits"
    }
  ]
};

export default function ProducerShopScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { state } = useCart();

  const handleBack = () => {
    router.back();
  };

  const handleCartPress = () => {
    router.push('/restaurant/order/cart');
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: '../order/product-detail',
      params: { 
        productId: product.id,
        productName: product.name,
        productPrice: product.priceDisplay
      }
    });
  };

  const renderProductCard = (product: any) => (
    <TouchableOpacity 
      key={product.id} 
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productEmoji}>
        <Text style={styles.emojiText}>{product.emoji}</Text>
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.priceDisplay}</Text>
      <Text style={styles.productStock}>{product.stock}</Text>
    </TouchableOpacity>
  );

  const renderCategory = (categoryName: string, products: any[]) => (
    <View key={categoryName} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{products.length}</Text>
        </View>
      </View>
      
      <View style={styles.productsGrid}>
        {products.map(renderProductCard)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Text style={styles.cartIcon}>🛒</Text>
          {state.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{state.totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <Image source={{ uri: mockProducer.bannerImage }} style={styles.bannerImage} />

        {/* Producer Info */}
        <View style={styles.producerSection}>
          <Image source={{ uri: mockProducer.profileImage }} style={styles.profileImage} />
          
          <View style={styles.producerInfo}>
            <Text style={styles.producerName}>{mockProducer.name}</Text>
            <Text style={styles.responsibleName}>{mockProducer.responsibleName}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{mockProducer.description}</Text>

        {/* Products and Categories */}
        <View style={styles.productsSection}>
          {Object.entries(mockProducts).map(([categoryName, products]) => 
            renderCategory(categoryName, products)
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: 11,
    paddingTop: 17,
    paddingBottom: 17,
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
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#89A083",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartIcon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FB2C36",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  menuButton: {
    width: 44,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonText: {
    fontSize: 20,
    color: "#4A4459",
  },

  // Content
  content: {
    flex: 1,
  },

  // Banner and producer info
  bannerImage: {
    width: "100%",
    height: 120,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  producerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: -40, // Overlap with banner
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  producerInfo: {
    flex: 1,
  },
  producerName: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#4A4459",
    marginBottom: 4,
  },
  responsibleName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4459",
  },

  // Description
  description: {
    fontSize: 12,
    color: "#4A4459",
    lineHeight: 22.75,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  // Products section
  productsSection: {
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4459",
  },
  categoryBadge: {
    backgroundColor: "#EAE9E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 14,
    color: "#4A4459",
    fontWeight: "500",
  },

  // Products grid
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  // Product card styles
  productCard: {
    width: 179,
    height: 171,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 16,
  },
  productEmoji: {
    width: 147,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 40,
    letterSpacing: 0.37,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A4459",
    marginBottom: 4,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#89A083",
    marginBottom: 4,
    textAlign: "center",
  },
  productStock: {
    fontSize: 12,
    color: "rgba(74, 68, 89, 0.7)",
    textAlign: "center",
  },
});