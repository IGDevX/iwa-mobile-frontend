import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from '../../../components/AuthContext';
import { useCart } from '../../../components/CartContext';
import { useNotifications } from '../../../hooks/useNotifications';
import { useProfileCompletion } from '../../../hooks/useProfileCompletion';
import { getUserByKeycloakId } from '../../../services/account';

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
    },
    {
      id: 5,
      name: "Courgettes",
      image: "https://photo-cdn2.icons8.com/WzUVwZCBFjpGJa-vCYcBVrVYdK3zGDGkEGC2v3zZ0vI/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTIxL2YyNWRk/MWQxLWM0MmQtNDdl/Yi1iMGRmLWFkMzk0/YTRlMmNlZi5qcGc.webp",
      price: 2.80,
      priceDisplay: "2.80€/kg",
      unit: "kg",
      category: "Légumes"
    },
    {
      id: 6,
      name: "Poivrons",
      image: "https://photo-cdn2.icons8.com/XEBnLz3xjwMuPGiXPSvWKJoKWPXmKT82ZqCXwBdvkts/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNDU0LzZjNDA2/NjcyLTk3MjMtNGRh/YS05OWNhLTM2YWU4/MWY4YmViMS5qcGc.webp",
      price: 4.20,
      priceDisplay: "4.20€/kg",
      unit: "kg",
      category: "Légumes"
    },
    {
      id: 7,
      name: "Aubergines",
      image: "https://photo-cdn2.icons8.com/GYaRDl_O0nH0xnvfp9YiC2JMbMYoZQfbeLY72kN8Fuw/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTg1LzgxZWNi/NjBjLWMzZTQtNDk5/NS05MzUzLTI0MjM2/ZGY4NTdiOS5qcGc.webp",
      price: 3.80,
      priceDisplay: "3.80€/kg",
      unit: "kg",
      category: "Légumes"
    },
    {
      id: 8,
      name: "Concombres",
      image: "https://photo-cdn2.icons8.com/9Vj5Mwb0JZKzMgKqIakrTFXQ1xQp5kMl8tLNALaBHkI/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvMTA5My81ZjRi/MjViMC01MmE1LTQ4/ZTctYWJlZC1iOGMy/MjUyMDRmYmUuanBn.webp",
      price: 1.90,
      priceDisplay: "1.90€/kg",
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
    },
    {
      id: 9,
      name: "Fraises",
      image: "https://photo-cdn2.icons8.com/WiXYz-_2CPzrL2QkuN-_PeK9z3BjvgONIGFGE3CJBug/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTI0LzUwMzVh/YTE2LTA1NDQtNDM2/My05N2FjLTViM2Rh/NTdjNTgzNC5qcGc.webp",
      price: 5.50,
      priceDisplay: "5.50€/kg",
      unit: "kg",
      category: "Fruits"
    },
    {
      id: 10,
      name: "Oranges",
      image: "https://photo-cdn2.icons8.com/I7TLiYFq_XLVGlmW8dkN8L0EG4e7q6GvJ8iCGRLXdvw/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNjA5L2YyY2Uz/NjcyLWYzY2ItNGZm/MC04MzdkLTAyYzIy/N2VkZGU5Ni5qcGc.webp",
      price: 3.00,
      priceDisplay: "3.00€/kg",
      unit: "kg",
      category: "Fruits"
    },
    {
      id: 11,
      name: "Poires",
      image: "https://photo-cdn2.icons8.com/xYJHEyQUF_qZo9MBzzNmzrLp0hOxkBRO5EXyXdZfKbE/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvODI0L2UzYzUx/NmE4LTA0ZTQtNGU1/Ny05N2RhLTQ0YTZj/Y2QyZjhmZC5qcGc.webp",
      price: 3.40,
      priceDisplay: "3.40€/kg",
      unit: "kg",
      category: "Fruits"
    },
    {
      id: 12,
      name: "Raisins",
      image: "https://photo-cdn2.icons8.com/IuU5pVz-ZsxFDJ4t5i_GgfXJwLiAWwmAJa0LS2XrXAQ/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTc2L2RkYzIz/NmI3LTdhMjYtNDdh/Ny1iNzE1LTQyMTFl/MDI5OGYwZi5qcGc.webp",
      price: 4.80,
      priceDisplay: "4.80€/kg",
      unit: "kg",
      category: "Fruits"
    }
  ],
  "Produits laitiers": [
    {
      id: 13,
      name: "Fromage de chèvre",
      image: "https://photo-cdn2.icons8.com/RvQXmn3v-FY4RZWZQ2ZUgPUbMd1EXCvGd1zRZHqD5JI/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTkvNTFjY2I5/MzAtNWYyOS00NTk4/LWIwMTgtYjc3ODJl/NjFmNmQ3LmpwZw.webp",
      price: 6.50,
      priceDisplay: "6.50€/pièce",
      unit: "pièce",
      category: "Produits laitiers"
    },
    {
      id: 14,
      name: "Yaourt nature",
      image: "https://photo-cdn2.icons8.com/4qh7MnTtF0jn0BwcADVo8BxJ1aG_7YqKfmPiNQf8pLo/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvOTQ0LzA0YjVl/YTFhLWY4YzItNDMx/NC05NDQ1LWI3Mjdk/ODI2OTM3My5qcGc.webp",
      price: 3.20,
      priceDisplay: "3.20€/lot",
      unit: "lot",
      category: "Produits laitiers"
    },
    {
      id: 15,
      name: "Beurre fermier",
      image: "https://photo-cdn2.icons8.com/eP_PZ9qLfJlREVVUiZvAWTfY4CRO1CdIFy2PqYpTzEE/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvMzg1LzI0MGE3/MzNiLTU1ZjEtNGUx/OC1iZDhjLWU5OGI5/ZDI5ZmRjZS5qcGc.webp",
      price: 4.50,
      priceDisplay: "4.50€/250g",
      unit: "250g",
      category: "Produits laitiers"
    },
    {
      id: 16,
      name: "Crème fraîche",
      image: "https://photo-cdn2.icons8.com/dJnXfhWm9cBrWl8RrfwJrYzMGxEGqnq7vRg0e7g7Hcg/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTkvYTM5OTVm/M2MtOTY1MC00NWEy/LTgwNTAtYTY1NmE0/MTkzMzU2LmpwZw.webp",
      price: 3.80,
      priceDisplay: "3.80€/pot",
      unit: "pot",
      category: "Produits laitiers"
    }
  ]
};

export default function ProducerShopScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { state } = useCart();
  const { state: authState } = useContext(AuthContext);
  const { hasUnreadNotifications } = useNotifications();
  const { isComplete: isProfileComplete, isLoading: isProfileLoading } = useProfileCompletion();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<ProductsData>(mockProducts);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Log temporaire pour récupérer votre Producer ID
  React.useEffect(() => {
    const fetchAndLogProducerId = async () => {
      if (authState.isSignedIn && authState.userInfo?.sub) {
        const keycloakId = authState.userInfo.sub;
        const email = authState.userInfo.email;

        console.log('========================================');
        console.log('🔑 KEYCLOAK INFO:');
        console.log('  - Keycloak ID (UUID):', keycloakId);
        console.log('  - Email:', email);
        console.log('  - Roles:', authState.userInfo.roles);
        console.log('========================================');

        try {
          const profile = await getUserByKeycloakId(keycloakId);
          console.log('========================================');
          console.log('✅ PRODUCER INFO FROM ACCOUNT SERVICE:');
          console.log('  - Producer ID (Number):', profile.id);
          console.log('  - Keycloak ID:', profile.keycloakId);
          console.log('========================================');
          console.log('💡 UTILISEZ CE PRODUCER ID DANS VOS SEEDS:', profile.id);
          console.log('========================================');
        } catch (error) {
          console.error('❌ Erreur lors de la récupération du Producer ID:', error);
        }
      }
    };

    fetchAndLogProducerId();
  }, [authState.isSignedIn, authState.userInfo]);

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

  const handleEditModeToggle = (value: boolean) => {
    // Check if profile is complete before enabling edit mode
    if (value && isOwnShop && !isProfileLoading && !isProfileComplete) {
      Alert.alert(
        t('profile.incomplete.title', 'Profile Incomplete'),
        t('profile.incomplete.message_producer', 'You must complete your profile before editing your shop. Would you like to complete it now?'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('profile.complete.title', 'Complete Profile'),
            onPress: () => router.push('/profile/complete-profile')
          }
        ]
      );
      return;
    }
    setIsEditMode(value);
  };

  const handleNotificationPress = () => {
    router.push('/notification');
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsScrollContainer}
      >
        {categoryProducts.map(renderProductCard)}
      </ScrollView>
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
                onValueChange={handleEditModeToggle}
                trackColor={{ false: '#757575', true: '#89A083' }}
                thumbColor={isEditMode ? '#fff' : '#fff'}
              />
              <Text style={styles.editModeText}>{t('producer.shop.edit_mode', 'Edit mode')}</Text>
            </View>
            <TouchableOpacity 
              style={{ ...styles.notificationButton, marginLeft: 20, marginRight: -18 }}
              onPress={handleNotificationPress}
            >
              <Image
                source={require("../../../assets/images/icons8-bell-96.png")}
                style={{ width: 30, height: 30, marginRight: 8 }}
              />
              {hasUnreadNotifications && (
                <View style={styles.notificationDot} />
              )}
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

  // Products scroll container
  productsScrollContainer: {
    paddingRight: 24,
    paddingVertical: 8,
    gap: 12,
  },

  // Product card styles
  productCard: {
    width: 160,
    height: 171,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
    paddingVertical: 16,
    marginRight: 12,
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
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 8,
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