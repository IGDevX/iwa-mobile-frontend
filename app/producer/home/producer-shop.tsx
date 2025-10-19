import React, { useContext, useState } from "react";
import { Text, Image, StyleSheet, ScrollView, TouchableOpacity, View, Alert, Switch, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../../components/CartContext";
import { AuthContext } from "../../../components/AuthContext";
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock producer data
const mockProducer = {
  name: "Ferme Bio Laurent",
  responsibleName: "Laurent Dupont",
  description: "Ferme responsable située à Loupian. Large variété de fruits et légumes issues de l'agriculture biologique.",
  bannerImage: "https://www.pretajardiner.com/modules/ph_simpleblog/featured/12.jpg",
  profileImage: "https://photo-cdn2.icons8.com/vVsONpHf7-sTgM9mNbSkmX0iCJP6YF9_Ux93NilJJkY/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA1L2NkNjhm/ODcwLWVjMmMtNDU2/OC1hNmE5LTk3ZGQw/NWE3Mjc3Mi5qcGc.webp"
};

// Type definitions
interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  priceDisplay: string;
  unit: string;
  category: string;
}

interface ProductsData {
  [key: string]: Product[];
}

// Mock products data organized by category
const mockProducts: ProductsData = {
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
  const { state: authState } = useContext(AuthContext);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<ProductsData>(mockProducts);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Determine if this is the producer's own shop
  const isOwnShop = authState.userInfo?.roles?.[0] === 'Producer';

  const handleCartPress = () => {
    // Check if user is logged in
    if (!authState.isSignedIn) {
      Alert.alert(
        t('auth.login.title', 'Login Required'),
        t('cart.login_required_message', 'You need to login to view your cart. Would you like to login now?'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('auth.login.sign_in', 'Login'),
            onPress: () => router.push('../../profile/login')
          }
        ]
      );
      return;
    }

    router.push('/restaurant/order/cart');
  };

  const handleProductPress = (product: any) => {
    if (isEditMode) {
      // Handle product editing
      handleEditProduct(product);
    } else {
      router.push({
        pathname: '../../restaurant/order/product-detail',
        params: {
          productId: product.id,
          productName: product.name,
          productPrice: product.priceDisplay
        }
      });
    }
  };

  const handleEditProduct = (product: any) => {
    Alert.alert(
      t('producer.edit_product', 'Edit Product'),
      `${t('producer.edit_product_message', 'Edit')} ${product.name}`,
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('producer.edit', 'Edit'), onPress: () => console.log('Edit product:', product.id) }
      ]
    );
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      t('producer.delete_product', 'Delete Product'),
      t('producer.delete_product_message', 'Are you sure you want to delete this product?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('producer.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            // Remove product from category
            const updatedProducts = { ...products };
            Object.keys(updatedProducts).forEach(category => {
              updatedProducts[category] = updatedProducts[category].filter(p => p.id !== productId);
            });
            setProducts(updatedProducts);
          }
        }
      ]
    );
  };

  const handleDeleteCategory = (categoryName: string) => {
    Alert.alert(
      t('producer.delete_category', 'Delete Category'),
      t('producer.delete_category_message', `Are you sure you want to delete the category "${categoryName}"?`),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('producer.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            const updatedProducts = { ...products };
            delete updatedProducts[categoryName];
            setProducts(updatedProducts);
          }
        }
      ]
    );
  };

  const handleAddProduct = (categoryName: string) => {
    router.push({
      pathname: '/producer/home/add-product',
      params: {
        categoryName: categoryName
      }
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const updatedProducts = { ...products };
      updatedProducts[newCategoryName.trim()] = [];
      setProducts(updatedProducts);
      setNewCategoryName('');
    }
  };

  const renderProductCard = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <TouchableOpacity
        style={styles.productCardContent}
        onPress={() => handleProductPress(product)}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.priceDisplay}</Text>
        {isEditMode && (
          <Text style={styles.stockText}>Stock: 10 kg</Text>
        )}
      </TouchableOpacity>

      {isEditMode && isOwnShop && (
        <TouchableOpacity
          style={styles.deleteProductButton}
          onPress={() => handleDeleteProduct(product.id)}
        >
          <Ionicons name="close-circle" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategory = (categoryName: string, categoryProducts: Product[]) => (
    <View key={categoryName} style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{categoryProducts.length}</Text>
        </View>
      </View>

      {isEditMode && isOwnShop && (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={styles.deleteCategory}
            onPress={() => handleDeleteCategory(categoryName)}
          >
            <Text style={styles.deleteCategoryText}>{t('producer.delete_category', 'Delete Category')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addProduct}
            onPress={() => handleAddProduct(categoryName)}
          >
            <Text style={styles.addProductText}>{t('producer.add_product', 'Add Product')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.productsGrid}>
        {categoryProducts.map(renderProductCard)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('producer.shop.my_shop', 'My Shop')}</Text>

        {isOwnShop && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.editModeContainer}>
              <Switch
                value={isEditMode}
                onValueChange={setIsEditMode}
                trackColor={{ false: '#757575', true: '#89A083' }}
                thumbColor={isEditMode ? '#fff' : '#fff'}
              />
              <Text style={styles.editModeText}>{t('producer.shop.edit_mode', 'Edit mode')}</Text>
            </View>
            <TouchableOpacity style={{...styles.notificationButton, marginLeft: 20, marginRight: -18 }}>
              <Image
                source={require("../../../assets/images/icons8-bell-96.png")}
                style={{ width: 30, height: 30, marginRight: 8 }}
              />
            </TouchableOpacity>
          </View>
        )}


        {!isOwnShop && (
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Image
              source={require('../../../assets/images/icons8-cart-96.png')}
              style={styles.cartIcon}
            />
            {authState.isSignedIn && state.totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{state.totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
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

        {/* New Category Section - Edit Mode Only */}
        {isEditMode && isOwnShop && (
          <View style={styles.newCategorySection}>
            <Text style={styles.newCategoryTitle}>{t('producer.new_category', 'New Category')}</Text>
            <View style={styles.newCategoryInput}>
              <TextInput
                style={styles.categoryInput}
                placeholder={t('producer.category_name', 'Category Name')}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholderTextColor="rgba(74, 68, 89, 0.5)"
              />
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={handleAddCategory}
              >
                <Ionicons name="add" size={20} color="#89A083" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products and Categories */}
        <View style={styles.productsSection}>
          {Object.entries(products).map(([categoryName, categoryProducts]) =>
            renderCategory(categoryName, categoryProducts)
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F7F6ED",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
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

  // Edit mode styles
  editModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE9E1",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 0,
    gap: 8,
  },
  editModeText: {
    fontSize: 14,
    color: "#4A4459",
    fontWeight: "500",
  },
  productCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  stockText: {
    fontSize: 12,
    color: "rgba(74, 68, 89, 0.7)",
    marginTop: 4,
    textAlign: "center",
  },
  deleteProductButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  deleteCategory: {
    backgroundColor: "#fcdcdc",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  deleteCategoryText: {
    fontSize: 12,
    color: "#660101",
    fontWeight: "500",
  },
  addProduct: {
    backgroundColor: "#dcfce7",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  addProductText: {
    fontSize: 12,
    color: "#016630",
    fontWeight: "500",
  },
  newCategorySection: {
    backgroundColor: "#EAE9E1",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  newCategoryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 12,
  },
  newCategoryInput: {
    flexDirection: "row",
    gap: 8,
  },
  categoryInput: {
    flex: 1,
    height: 37,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#4A4459",
  },
  addCategoryButton: {
    width: 48,
    height: 37,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});