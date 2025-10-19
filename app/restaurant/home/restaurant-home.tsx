import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";

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
    image: "https://photo-cdn2.icons8.com/6-T_VL6CNAS2Ye_pJTjt3Ng2XCJizRvKF6QbAJQCif4/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTU5L2NlNjZj/YTIxLTE4MmItNGI0/My1hMzY1LTI0YjA0/M2EyYjI5My5qcGc.webp",
    pickupMode: "Both"
  },
  {
    id: 2,
    name: "Miel de lavande",
    category: "Epicerie",
    producer: "Apiculteur",
    price: "11.50€/kg",
    distance: "6 km",
    badges: ["Local"],
    image: "https://photo-cdn2.icons8.com/nNIReTJu1PtvM-SzNMkYt3ofHtYPHnMhMisoc4IoFIo/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA4LzFjOGRi/NzU5LWUyNTctNDA1/Yy1iMmU3LTc1ZDdl/ZjdhZGNkNy5qcGc.webp",
    pickupMode: "Domicile"
  },
  {
    id: 3,
    name: "Fromage de chèvre",
    category: "Fromage",
    producer: "Ferme des Oliviers",
    price: "9.0€/kg",
    distance: "3 km",
    badges: ["Bio", "Local"],
    image: "https://photo-cdn2.icons8.com/FrhVLQsz0DqYKwdDxVIrFoyDSuXqaL7rUZl7H9XJ18I/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTM3L2NiM2Ux/ZDZiLWI1MjctNDY5/Ni1hZDU0LWZkYTI4/N2YzZDc0MS5qcGc.webp",
    pickupMode: "Livraison"
  }
];

export default function RestaurantHomeScreen() {
  const { t } = useTranslation();

  // Optimized function to render pickup mode icons
  const renderPickupModeIcons = (pickupMode: string, distance: string) => {
    const iconStyle = { width: 14, height: 14, marginRight: 8 };
    const deliveryIcon = require("../../../assets/images/icons8-delivery-96.png");
    const homeIcon = require("../../../assets/images/icons8-home-96.png");

    const iconComponents = {
      Livraison: [
        <Image key="delivery" source={deliveryIcon} style={iconStyle} />
      ],
      Domicile: [
        <Image key="home" source={homeIcon} style={iconStyle} />
      ],
      Both: [
        <Image key="delivery" source={deliveryIcon} style={iconStyle} />,
        <Image key="home" source={homeIcon} style={iconStyle} />
      ]
    };

    return (
      <>
        {iconComponents[pickupMode as keyof typeof iconComponents] || iconComponents.Both}
        <Text style={styles.distanceText}>{distance}</Text>
      </>
    );
  };

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
            {renderPickupModeIcons(product.pickupMode, product.distance)}
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
          <Image 
            source={require("../../../assets/images/icons8-bell-96.png")} 
            style={{ width: 30, height: 30, marginRight: 8 }} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image 
            source={require("../../../assets/images/icons8-search-96.png")} 
            style={{ width: 20, height: 20, marginRight: 8 }} 
          />
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
            <Ionicons name="chevron-down" style={styles.filtersArrow} />
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
    borderRadius: 18,
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

  },
  searchBar: {
    backgroundColor: "#EAE9E1",
    borderColor: "#eae9e1",
    borderWidth: 0,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
    height: 55,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  searchText: { 
    fontSize: 14, 
    color: "#717182" 
  },
  
    filtersArrow: {
    fontSize: 16,
    color: "#000000ff",
  },

  // Categories styles
  categoriesScroll: { 
    marginBottom: 30, 
    paddingLeft: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 28,
    paddingRight: 20,
  },
  categoryCard: {
    width: 70,
    height: 138,
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
    marginBottom: 10,
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
    fontSize: 15, 
    color: "#4A4459" 
  },
  filterIcon: { 
    fontSize: 16, 
    color: "rgba(74,68,89,0.5)" 
  },

  // Products list styles
  productsList: { 
    paddingHorizontal: 16,
    paddingTop: 10,
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
