import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Mockup data for products
const mockProducts = [
  {
    id: 1,
    name: "Tomates Bio du Var",
    category: "Légume",
    producer: "Ferme des Oliviers",
    price: "4.50€/kg",
    distance: "3 km",
    badges: ["Bio", "Local"],
    image: "https://placehold.co/150x150/89A083/FFFFFF?text=Tomates"
  },
  {
    id: 2,
    name: "Miel de lavande",
    category: "Epicerie",
    producer: "Apiculteur",
    price: "11.50€/kg",
    distance: "6 km",
    badges: ["Local"],
    image: "https://placehold.co/150x150/E8DFDA/4A4459?text=Miel"
  },
  {
    id: 3,
    name: "Fromage de chèvre",
    category: "Fromage",
    producer: "Ferme des Oliviers",
    price: "9.0€/kg",
    distance: "3 km",
    badges: ["Bio", "Local"],
    image: "https://placehold.co/150x150/81B29A/FFFFFF?text=Fromage"
  }
];

export default function RestaurantHomeScreen() {
  const { t } = useTranslation();

  const categories = [
    { label: "Vin", icon: require("../../../assets/images/icons8-wine-96.png") },
    { label: "Légumes", icon: require("../../../assets/images/icons8-broccoli-96.png") },
    { label: "Fruits", icon: require("../../../assets/images/icons8-watermelon-96.png") },
    { label: "Viande", icon: require("../../../assets/images/icons8-steak-96.png") },
    { label: "Miel", icon: require("../../../assets/images/icons8-honeycombs-96.png") },
  ];

  const filters = ["Labels", "Livraison", "Prix"];

  const renderProductCard = (product: typeof mockProducts[0]) => (
    <TouchableOpacity 
      key={product.id} 
      style={styles.productCard}
      onPress={() => router.push({
        pathname: '../order/product-detail',
        params: { 
          productId: product.id,
          productName: product.name,
          productPrice: product.price
        }
      })}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productProducer}>{product.producer}</Text>
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Bottom info: distance and price */}
        <View style={styles.productFooter}>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{product.distance}</Text>
          </View>
          <Text style={styles.priceText}>{product.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Montpellier</Text>
        </TouchableOpacity>
        
        <Image source={{ uri: "https://placehold.co/50x50" }} style={styles.profileImage} />
        
        <TouchableOpacity style={styles.notificationButton}>
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Search products or producers…</Text>
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <View style={styles.categoriesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.label} style={styles.categoryCard}>
              <Image source={cat.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity key={filter} style={styles.filterButton}>
            <Text style={styles.filterText}>{filter}</Text>
            <Text style={styles.filterIcon}>⌄</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products List */}
      <ScrollView style={styles.productsList} contentContainerStyle={{ paddingBottom: 120 }}>
        {mockProducts.map(renderProductCard)}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F6ED" 
  },
  
  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: "#F7F6ED",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE9E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  locationText: { 
    fontSize: 14, 
    color: "#4A4459",
    fontWeight: "500",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E07A5F",
  },

  // Search styles
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "#f3f3f583",
    borderColor: "#EAE9E1",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 46,
    justifyContent: "center",
  },
  searchText: { 
    fontSize: 14, 
    color: "#717182" 
  },

  // Categories styles
  categoriesScroll: { 
    marginBottom: 16, 
    paddingLeft: 16 
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 26,
  },
  categoryCard: {
    width: 70,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F6ED",
    borderRadius: 12,
    paddingVertical: 8,
  },
  categoryIcon: { 
    width: 62, 
    height: 62, 
    marginBottom: 4,
  },
  categoryText: { 
    fontSize: 12, 
    textAlign: "center", 
    color: "#4A4459" 
  },

  // Filters styles
  filtersContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginHorizontal: 16, 
    marginBottom: 16 
  },
  filterButton: {
    width: 120,
    flexDirection: "row",
    backgroundColor: "#EAE9E1",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterText: { 
    fontSize: 14, 
    color: "#4A4459" 
  },
  filterIcon: { 
    fontSize: 16, 
    color: "rgba(74,68,89,0.5)" 
  },

  // Products list styles
  productsList: { 
    paddingHorizontal: 16 
  },

  // Product card styles
  productCard: {
    height: 168,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  productImage: {
    width: 150,
    height: 150,
    margin: 9,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 4,
    letterSpacing: -0.31,
  },
  productCategory: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.6)",
    marginBottom: 4,
    letterSpacing: -0.15,
  },
  productProducer: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.6)",
    marginBottom: 8,
    letterSpacing: -0.15,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "rgba(129, 178, 154, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: "#81B29A",
    fontWeight: "500",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: "rgba(74, 68, 89, 0.6)",
    letterSpacing: -0.15,
  },
  priceText: {
    fontSize: 16,
    color: "#E07A5F",
    fontWeight: "500",
    letterSpacing: -0.31,
  },
});
