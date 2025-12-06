import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { AuthContext } from "../../../components/AuthContext";
import { useCart } from "../../../components/CartContext";
import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
import SignupChoiceModal from "../../../components/SignupChoiceModal";
import { getProduct } from "../../../services/shop/shopService";
import { getKeycloakIdByUserId, getCompleteUserProfile } from "../../../services/account/accountService";
import type { ProductResponse } from "../../../services/shop/shopApi";

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { addItem, getItemQuantity } = useCart();
  const { state } = useContext(AuthContext);
  const { isComplete: isProfileComplete, isLoading: isProfileLoading } = useProfileCompletion();

  // State for product and producer data
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [producer, setProducer] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Modal state
  const [showSignupChoice, setShowSignupChoice] = useState(false);

  // Get product ID from params
  const productId = params.productId as string;

  // Helper function to get Keycloak admin token
  const getKeycloakAdminToken = async (): Promise<string | null> => {
    try {
      const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
      const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
      const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG;

      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('client_id', 'admin-cli');
      formData.append('username', adminUsername);
      formData.append('password', adminPassword);

      const response = await fetch(
        `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        console.error('Failed to get admin token:', response.status);
        return null;
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting admin token:', error);
      return null;
    }
  };

  // Load product and producer data
  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) {
        Alert.alert(
          t('common.error', 'Error'),
          t('product.not_found', 'Product not found')
        );
        router.back();
        return;
      }

      try {
        setIsLoadingData(true);

        // Load product details
        const productData = await getProduct(productId);
        setProduct(productData);

        // Load producer details only if user is logged in
        if (state.isSignedIn && productData.producerId) {
          try {
            console.log('🔄 Loading producer data for producerId:', productData.producerId);

            // Step 1: Get Keycloak ID from Account Service User ID
            const producerKeycloakId = await getKeycloakIdByUserId(productData.producerId);
            console.log('✅ Producer Keycloak ID retrieved:', producerKeycloakId);

            // Step 2: Get complete producer profile using Keycloak ID
            const completeProfile = await getCompleteUserProfile(producerKeycloakId, getKeycloakAdminToken);
            console.log('✅ Complete producer profile loaded:', completeProfile);

            // Step 3: Format producer data for display
            const producerData = {
              id: productData.producerId,
              keycloakId: producerKeycloakId,
              name: completeProfile.keycloak.displayName || `Producteur #${productData.producerId}`,
              shopName: completeProfile.keycloak.displayName || `Boutique du producteur`,
              responsibleName: completeProfile.keycloak.responsibleName,
              phoneNumber: completeProfile.keycloak.phoneNumber,
              email: completeProfile.keycloak.email,
              address: completeProfile.keycloak.address,
              biography: completeProfile.accountService.biography,
              organizationType: completeProfile.keycloak.profession,
            };

            setProducer(producerData);
            console.log('✅ Producer data set successfully');
          } catch (error: any) {
            console.error('❌ Error loading producer data:', error);
            console.log('ℹ️ Producer ID:', productData.producerId);
            console.log('ℹ️ Using fallback producer data');

            // Set fallback producer data so the UI can still display something
            setProducer({
              id: productData.producerId,
              name: `Producteur #${productData.producerId}`,
              shopName: `Boutique du producteur #${productData.producerId}`,
            });
          }
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        Alert.alert(
          t('common.error', 'Error'),
          t('product.load_error', 'Failed to load product details')
        );
        router.back();
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProductData();
  }, [productId]);

  // Determine user role
  const userRole = state.userInfo?.roles?.[0];
  const isProducerUser = userRole === 'Producer';
  const isRestaurantOwner = userRole === 'Restaurant Owner';

  // Get current quantity in cart for this product (only for restaurant owners)
  const cartQuantity = !isProducerUser && product ? getItemQuantity(product.id) : 0;

  const handleBack = () => {
    router.back();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  // Handler to open signup/login modal
  const handleOpenSignupModal = () => {
    setShowSignupChoice(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setShowSignupChoice(false);
  };

  // Handler for existing user (from modal)
  const handleExistingUserPress = () => {
    setShowSignupChoice(false);
    // The modal itself handles navigation to login
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Producers cannot add their own products to cart
    if (isProducerUser) {
      Alert.alert(
        t('common.info', 'Information'),
        t('producer.cannot_add_own_product', 'You cannot add your own products to cart.'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    // Check if user is logged in
    if (!state.isSignedIn) {
      Alert.alert(
        t('auth.login.title', 'Login Required'),
        t('cart.login_required_message', 'You need to login to add items to cart. Would you like to login now?'),
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

    // Check if profile is complete (for Restaurant Owners)
    if (isRestaurantOwner && !isProfileLoading && !isProfileComplete) {
      Alert.alert(
        t('profile.incomplete.title', 'Profile Incomplete'),
        t('profile.incomplete.message_restaurant', 'You must complete your profile before placing orders. Would you like to complete it now?'),
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

    // Add to cart using CartContext
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      unit: product.unit.code,
      quantity: quantity,
      category: product.category.name,
      image: product.mainImageUrl || 'https://via.placeholder.com/150',
      producerId: product.producerId,
      producerName: producer?.name || 'Unknown Producer'
    });
  };

  const handleViewShop = () => {
    if (!product || !producer) return;

    console.log('🏪 Navigating to producer shop with:', {
      producerId: product.producerId,
      producerKeycloakId: producer.keycloakId,
      producerName: producer.name,
    });

    // Navigate to producer's shop
    router.push({
      pathname: '/producer/home/producer-shop',
      params: {
        producerId: product.producerId.toString(),
        producerKeycloakId: producer.keycloakId || '', // Pass Keycloak ID for external producer view
        producerName: producer.name || 'Producer',
        isViewMode: 'true' // Mode restaurateur POV (sans édition)
      }
    });
  };

  const handleCartPress = () => {
    // Producers don't have cart access
    if (isProducerUser) {
      return;
    }

    // Check if user is logged in
    if (!state.isSignedIn) {
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

  // Show loading state
  if (isLoadingData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  // Show error if product not found
  if (!product) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{t('product.not_found', 'Product not found')}</Text>
        <TouchableOpacity style={styles.backToSearchButton} onPress={() => router.back()}>
          <Text style={styles.backToSearchText}>{t('common.go_back', 'Go Back')}</Text>
        </TouchableOpacity>
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

        {/* Only show cart button for logged in restaurant owners */}
        {!isProducerUser && state.isSignedIn && (
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
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image
          source={{ uri: product.mainImageUrl || 'https://via.placeholder.com/400?text=No+Image' }}
          style={styles.productImage}
        />
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.price}>
                {product.price.toFixed(2)} {product.currency.code}/{product.unit.code}
              </Text>
            </View>

            {!isProducerUser && state.isSignedIn && (
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
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('product.description')}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Category and Shelf Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product.information', 'Information')}</Text>
            <View style={styles.characteristicItem}>
              <View style={styles.bullet} />
              <Text style={styles.characteristicText}>
                {t('product.category', 'Category')}: {product.category.name}
              </Text>
            </View>
            <View style={styles.characteristicItem}>
              <View style={styles.bullet} />
              <Text style={styles.characteristicText}>
                {t('product.shelf', 'Shelf')}: {product.shelf.label}
              </Text>
            </View>
            {product.isFresh && (
              <View style={styles.characteristicItem}>
                <View style={styles.bullet} />
                <Text style={styles.characteristicText}>
                  ✓ {t('product.fresh', 'Fresh Product')}
                </Text>
              </View>
            )}
            {product.certifications && product.certifications.length > 0 && (
              <View style={styles.characteristicItem}>
                <View style={styles.bullet} />
                <Text style={styles.characteristicText}>
                  {t('product.certifications', 'Certifications')}: {product.certifications.map(c => c.label).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Producer Card - Only show if user is logged in */}
        {state.isSignedIn && (
          <View style={styles.producerCard}>
            <Text style={styles.producerTitle}>{t('product.producer_section', 'Producteur')}</Text>

            <TouchableOpacity onPress={handleViewShop} style={styles.producerInfo}>
              {/* Profile Image - Mock if not available */}
              <Image
                source={{
                  uri: producer?.profilePictureUrl || 'https://ui-avatars.com/api/?name=' +
                       encodeURIComponent(producer?.name || product.producerId.toString()) +
                       '&background=89A083&color=fff&size=80'
                }}
                style={styles.producerImage}
              />

              <View style={styles.producerDetails}>
                <TouchableOpacity onPress={handleViewShop}>
                  <Text style={styles.producerName}>
                    {producer?.name || producer?.shopName || `Producteur #${product.producerId}`}
                  </Text>
                </TouchableOpacity>

                {producer?.organizationType && (
                  <Text style={styles.producerType}>{producer.organizationType}</Text>
                )}

                {/* Afficher l'adresse avec l'épingle uniquement si l'adresse est disponible */}
                {producer?.address && (
                  <View style={styles.addressContainer}>
                    <Image source={require('../../../assets/images/icons8-map-pin-96.png')} style={styles.addressIcon} />
                    <Text style={styles.address}>
                      {producer.address}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shopButton} onPress={handleViewShop}>
              <Text style={styles.shopButtonText}>{t('product.view_shop', 'Voir la boutique')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Cart Section - Only for Restaurant Owners */}
      {!isProducerUser && (
        <View style={styles.bottomSection}>
          {state.isSignedIn ? (
            <>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>
                  {t('product.total')} ({quantity} {product.unit.code})
                </Text>
                <Text style={styles.totalPrice}>
                  {(product.price * quantity).toFixed(2)} {product.currency.code}
                </Text>
              </View>

              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Text style={styles.addToCartText}>
                  {t('product.add_to_cart')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.loginPromptContainer}>
              <Text style={styles.loginPromptText}>
                {t('product.login_prompt_prefix', 'Pour ajouter un produit au panier et parcourir les boutiques de producteurs, veuillez ')}{' '}
                <Text
                  style={styles.loginPromptLink}
                  onPress={handleOpenSignupModal}
                >
                  {t('product.login_prompt_link', 'vous connecter')}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Signup/Login Choice Modal */}
      <SignupChoiceModal
        visible={showSignupChoice}
        onClose={handleCloseModal}
        onExistingUser={handleExistingUserPress}
      />
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
    width: 14,
    height: 14,
    tintColor: "rgba(74, 68, 89, 0.7)",
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
  loginPromptContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loginPromptText: {
    fontSize: 14,
    color: "#4A4459",
    textAlign: "center",
    lineHeight: 20,
  },
  loginPromptLink: {
    fontSize: 14,
    color: "#89A083",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Loading and error states
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A4459',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  backToSearchButton: {
    backgroundColor: '#7B61FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToSearchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});