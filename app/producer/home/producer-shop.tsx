import React from "react";
import { Text, Image, StyleSheet, ScrollView, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../../components/CartContext";

// Mock producer data
const mockProducer = {
  name: "Ferme Bio Laurent",
  responsibleName: "Laurent Dupont",
  description: "Ferme responsable située à Loupian. Large variété de fruits et légumes issues de l'agriculture biologique.",
  bannerImage: "https://www.pretajardiner.com/modules/ph_simpleblog/featured/12.jpg",
  profileImage: "https://photo-cdn2.icons8.com/vVsONpHf7-sTgM9mNbSkmX0iCJP6YF9_Ux93NilJJkY/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA1L2NkNjhm/ODcwLWVjMmMtNDU2/OC1hNmE5LTk3ZGQw/NWE3Mjc3Mi5qcGc.webp"
};

// Mock products data organized by category
const mockProducts = {
  "Légumes": [
    {
      id: 1,
      name: "Tomates",
      image: "https://photo-cdn2.icons8.com/6-T_VL6CNAS2Ye_pJTjt3Ng2XCJizRvKF6QbAJQCif4/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTU5L2NlNjZj/YTIxLTE4MmItNGI0/My1hMzY1LTI0YjA0/M2EyYjI5My5qcGc.webp",
      price: 3.50,
      priceDisplay: "3.50€/kg",
      unit: "kg",
      category: "Légumes"
    },
    {
      id: 2,
      name: "Carottes",
      image: "https://photo-cdn2.icons8.com/b17y6AdWPJxou6nd6LjjL4z6QztACk3sOJn512kpyaQ/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvMjY5L2UzN2Qz/ZmFkLWQ4MDctNDEz/ZC1hYzFhLWVjZjJl/YmM4YjE5ZS5qcGc.webp",
      price: 2.20,
      priceDisplay: "2.20€/kg",
      unit: "kg",
      category: "Légumes"
    }
  ],
  "Fruits": [
    {
      id: 3,
      name: "Pommes",
      image: "https://photo-cdn2.icons8.com/V6OT-875dhasusUM-3l7Z4sCZuyC5koCOwIw7Cu4NC4/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvMjQxLzdiZWM5/ODU5LTFhNTgtNGNi/NC04ZTJhLThjNTNm/Nzk3MGNkZi5qcGc.webp",
      price: 2.80,
      priceDisplay: "2.80€/kg",
      unit: "kg",
      category: "Fruits"
    },
    {
      id: 4,
      name: "Citrons",
      image: "https://photo-cdn2.icons8.com/V7Lh4btN4b-LJhjd0nAMbdX-ZPI-1I-IaB-G7tSvERA/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNDkvYjY1OTNj/M2YtZGMzNC00MTg1/LWEzOTctMjVlYzYz/ZmIyZTEzLmpwZw.webp",
      price: 3.20,
      priceDisplay: "3.20€/kg",
      unit: "kg",
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
      pathname: '../../restaurant/order/product-detail',
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
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.priceDisplay}</Text>
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
          
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Image
            source={require('../../../assets/images/icons8-cart-96.png')}
            style={styles.cartIcon}
          />
          {state.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{state.totalItems}</Text>
            </View>
          )}
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
    borderRadius: 15,
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
    width: "95%",
    height: 120,
    borderRadius: 25,
    alignSelf: "center",
  },
  producerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: -40, // Overlap with banner
    marginBottom: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginRight: 20,
  },
  producerInfo: {
    flex: 1,
    marginTop: 55,
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
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  }
});