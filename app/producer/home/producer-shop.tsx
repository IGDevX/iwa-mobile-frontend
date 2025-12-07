import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
import { useProducerShopData } from '../../../hooks/useProducerShopData';
import { getCompleteUserProfile } from '../../../services/account';
import { createShelf, deleteProduct, deleteShelf, updateShelf, type ProductResponse, type ShelfResponse } from '../../../services/shop';


export default function ProducerShopScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { state } = useCart();
  const { state: authState } = useContext(AuthContext);
  const { hasUnreadNotifications } = useNotifications();
  const { isComplete: isProfileComplete, isLoading: isProfileLoading } = useProfileCompletion();

  // Check if we're viewing another producer's shop (restaurateur mode)
  const isViewMode = params.isViewMode === 'true';
  const externalProducerKeycloakId = params.producerKeycloakId as string | undefined;
  const externalProducerName = params.producerName as string | undefined;

  console.log('🏪 [PRODUCER-SHOP] Initialization:', {
    isViewMode,
    externalProducerKeycloakId,
    externalProducerName,
    currentUserKeycloakId: authState.userInfo?.sub,
  });

  // Récupération des données depuis le backend
  const {
    producerId,
    shelves,
    productsByShelf,
    isLoading: isLoadingShopData,
    error: shopDataError,
    refreshData,
  } = useProducerShopData({
    externalProducerKeycloakId: isViewMode ? externalProducerKeycloakId : undefined,
  });

  // Producer profile state
  const [producerProfile, setProducerProfile] = useState({
    displayName: '',
    responsibleName: '',
    biography: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);

  // Shelf editing state
  const [editingShelfId, setEditingShelfId] = useState<number | null>(null);
  const [editingShelfName, setEditingShelfName] = useState('');

  // Track first load to avoid refreshing on initial mount
  const isFirstLoad = useRef(true);

  // Determine if this is the producer's own shop
  const isOwnShop = authState.userInfo?.roles?.[0] === 'Producer';

  // Helper function to get admin token (same as my-profile)
  const getKeycloakAdminToken = async (): Promise<string | null> => {
    try {
      const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
      const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
      const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_BASE_URL;

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

  // Function to load producer profile data
  const loadProducerProfile = useCallback(async () => {
    try {
      // Determine which Keycloak ID to use
      let keycloakIdToLoad: string;

      if (isViewMode && externalProducerKeycloakId) {
        // We're viewing another producer's shop
        keycloakIdToLoad = externalProducerKeycloakId;
        console.log('🔄 [PRODUCER-SHOP] Loading external producer profile:', keycloakIdToLoad);
      } else if (isOwnShop && authState.isSignedIn && authState.userInfo?.sub) {
        // We're viewing our own shop
        keycloakIdToLoad = authState.userInfo.sub;
        console.log('🔄 [PRODUCER-SHOP] Loading own producer profile:', keycloakIdToLoad);
      } else {
        // No valid scenario to load profile
        setIsLoadingProfile(false);
        return;
      }

      // Use the combined function to get both Keycloak and Account Service data
      const completeProfile = await getCompleteUserProfile(keycloakIdToLoad, getKeycloakAdminToken);

      // Set producer profile data (Keycloak + Account Service)
      setProducerProfile({
        displayName: completeProfile.keycloak.displayName || externalProducerName || '',
        responsibleName: completeProfile.keycloak.responsibleName || '',
        biography: completeProfile.accountService.biography || '',
      });

      console.log('✅ [PRODUCER-SHOP] Producer profile loaded successfully');
    } catch (error) {
      console.error('❌ [PRODUCER-SHOP] Error loading producer profile:', error);
      // Keep empty data on error
    } finally {
      setIsLoadingProfile(false);
    }
  }, [authState.isSignedIn, authState.userInfo?.sub, isOwnShop, isViewMode, externalProducerKeycloakId, externalProducerName]);

  // Load profile data when component mounts or auth state changes
  React.useEffect(() => {
    // Load profile if:
    // 1. Own shop and authenticated, OR
    // 2. View mode with external producer Keycloak ID
    if ((isOwnShop && authState.isSignedIn) || (isViewMode && externalProducerKeycloakId)) {
      loadProducerProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [authState.isSignedIn, authState.userInfo, isOwnShop, isViewMode, externalProducerKeycloakId, loadProducerProfile]);

  // Rafraîchir les données quand on revient sur la page (après ajout de produit par exemple)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [PRODUCER-SHOP] useFocusEffect triggered');
      console.log('🔄 [PRODUCER-SHOP] isFirstLoad:', isFirstLoad.current);

      // Ne pas rafraîchir au premier chargement (déjà fait par useEffect)
      if (isFirstLoad.current) {
        console.log('🔄 [PRODUCER-SHOP] First load, skipping refresh');
        isFirstLoad.current = false;
        return;
      }

      // Rafraîchir les shelves et produits seulement quand on revient sur la page
      console.log('🔄 [PRODUCER-SHOP] Refreshing shop data...');
      refreshData();
    }, [refreshData])
  );

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
    // Annuler l'édition en cours si on désactive le mode Edit
    if (!value) {
      handleCancelEditShelf();
    }
  };

  const handleNotificationPress = () => {
    router.push('/notification');
  };

  const handleProductPress = (product: any) => {
    if (isEditMode) {
      // Handle product editing
      handleEditProduct(product);
    } else {
      // Navigate to product detail page (centralisé)
      console.log('👀 [PRODUCER-SHOP] Viewing product:', product.id);
      router.push({
        pathname: '/restaurant/order/product-detail',
        params: {
          productId: product.id.toString(),
          fromShop: 'true', // Pour gérer le bouton retour
          isOwner: isOwnShop ? 'true' : 'false'
        }
      });
    }
  };

  const handleEditProduct = (product: any) => {
    console.log('✏️ [PRODUCER-SHOP] Editing product:', product.id);
    router.push({
      pathname: './edit-product',
      params: {
        product: JSON.stringify(product),
      },
    });
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
          onPress: async () => {
            try {
              console.log('🗑️ [DELETE-PRODUCT] Deleting product:', productId);
              await deleteProduct(productId);
              console.log('✅ [DELETE-PRODUCT] Product deleted successfully');

              // Rafraîchir les données
              await refreshData();

              Alert.alert(
                t('producer.success', 'Success'),
                t('producer.product_deleted', 'Product deleted successfully!')
              );
            } catch (error: any) {
              console.error('❌ [DELETE-PRODUCT] Delete failed:', error);

              // Gérer le cas 404 (produit déjà supprimé ou inexistant)
              if (error.message && error.message.includes('404')) {
                // Le produit n'existe plus, on rafraîchit quand même pour mettre à jour l'affichage
                await refreshData();
                Alert.alert(
                  t('producer.info', 'Information'),
                  t('producer.product_not_found', 'This product has already been deleted or does not exist.')
                );
              } else {
                Alert.alert(
                  t('producer.error', 'Error'),
                  t('producer.product_deletion_failed', 'Failed to delete product. Please try again.')
                );
              }
            }
          }
        }
      ]
    );
  };

  const handleEditShelf = (shelfId: number, currentName: string) => {
    setEditingShelfId(shelfId);
    setEditingShelfName(currentName);
  };

  const handleCancelEditShelf = () => {
    setEditingShelfId(null);
    setEditingShelfName('');
  };

  const handleSaveShelfName = async (shelfId: number) => {
    console.log('🔵 [EDIT-SHELF] Starting shelf update:', {
      shelfId,
      newName: editingShelfName.trim(),
      producerId,
    });

    if (!editingShelfName.trim()) {
      console.log('❌ [EDIT-SHELF] Validation failed: empty name');
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.shelf_name_required', 'Please enter a shelf name')
      );
      return;
    }

    if (!producerId) {
      console.log('❌ [EDIT-SHELF] Validation failed: no producerId');
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.producer_id_missing', 'Producer ID not found')
      );
      return;
    }

    try {
      console.log('📤 [EDIT-SHELF] Calling updateShelf API...');
      const result = await updateShelf(shelfId, editingShelfName.trim(), producerId);
      console.log('✅ [EDIT-SHELF] Update successful:', result);

      // Rafraîchir les données
      console.log('🔄 [EDIT-SHELF] Refreshing data...');
      await refreshData();

      // Réinitialiser l'état d'édition
      setEditingShelfId(null);
      setEditingShelfName('');

      Alert.alert(
        t('producer.success', 'Success'),
        t('producer.shelf_updated', 'Shelf updated successfully!')
      );
    } catch (error) {
      console.error('❌ [EDIT-SHELF] Update failed:', error);
      console.error('❌ [EDIT-SHELF] Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.shelf_update_failed', 'Failed to update shelf. Please try again.')
      );
    }
  };

  const handleDeleteShelf = async (shelfId: number, shelfName: string) => {
    Alert.alert(
      t('producer.delete_shelf', 'Delete Shelf'),
      t('producer.delete_shelf_message', `Are you sure you want to delete the shelf "${shelfName}"?`),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('producer.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShelf(shelfId);

              Alert.alert(
                t('producer.success', 'Success'),
                t('producer.shelf_deleted', 'Shelf deleted successfully!')
              );

              // Rafraîchir les données
              await refreshData();
            } catch (_error) {
              Alert.alert(
                t('producer.error', 'Error'),
                t('producer.shelf_deletion_failed', 'Failed to delete shelf. Please try again.')
              );
            }
          }
        }
      ]
    );
  };

  const handleAddProduct = (shelfId: number, shelfName: string) => {
    if (!producerId) {
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.producer_id_missing', 'Producer ID not found')
      );
      return;
    }

    router.push({
      pathname: '/producer/home/add-product',
      params: {
        shelfId: shelfId.toString(),
        shelfName: shelfName,
        producerId: producerId.toString(),
      }
    });
  };

  const handleAddShelf = async () => {
    if (!newShelfName.trim()) {
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.shelf_name_required', 'Please enter a shelf name')
      );
      return;
    }

    if (!producerId) {
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.producer_id_missing', 'Producer ID not found')
      );
      return;
    }

    setIsCreatingShelf(true);
    try {
      await createShelf(newShelfName.trim(), producerId);

      // Rafraîchir les données pour afficher la nouvelle shelf
      await refreshData();

      // Réinitialiser le champ
      setNewShelfName('');

      Alert.alert(
        t('producer.success', 'Success'),
        t('producer.shelf_created', 'Shelf created successfully!')
      );
    } catch (_error) {
      Alert.alert(
        t('producer.error', 'Error'),
        t('producer.shelf_creation_failed', 'Failed to create shelf. Please try again.')
      );
    } finally {
      setIsCreatingShelf(false);
    }
  };

  // Rendu d'un produit depuis le backend (ProductResponse)
  const renderRealProductCard = (product: ProductResponse) => (
    <View key={product.id} style={styles.productCard}>
      <TouchableOpacity
        style={styles.productCardContent}
        onPress={() => handleProductPress(product)}
      >
        <View style={styles.productImageContainer}>
          {product.mainImageUrl ? (
            <Image
              source={{ uri: product.mainImageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="image-outline" size={30} color="#89A083" />
            </View>
          )}
        </View>
        <Text style={styles.productName}>{product.title}</Text>
        <Text style={styles.productPrice}>
          {product.price}€/{product.unit.code || product.unit.label}
        </Text>
        {isEditMode && (
          <Text style={styles.stockText}>Stock: {product.title}</Text>
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

  // Rendu d'une shelf (rayon) avec ses produits
  const renderShelf = (shelf: ShelfResponse) => {
    const shelfProducts = productsByShelf[shelf.id] || [];
    const shelfName = shelf.label;
    const isEditing = editingShelfId === shelf.id;

    return (
      <View key={shelf.id} style={styles.shelfSection}>
        <View style={styles.shelfHeader}>
          {isEditing ? (
            <View style={styles.editShelfNameContainer}>
              <TextInput
                style={styles.editShelfNameInput}
                value={editingShelfName}
                onChangeText={setEditingShelfName}
                placeholder={t('producer.shelf_name', 'Shelf Name')}
                placeholderTextColor="rgba(74, 68, 89, 0.5)"
                autoFocus
              />
              <TouchableOpacity
                style={styles.cancelShelfButton}
                onPress={handleCancelEditShelf}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.validateShelfButton}
                onPress={() => handleSaveShelfName(shelf.id)}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.shelfTitle}>{shelfName}</Text>
              <View style={styles.shelfBadge}>
                <Text style={styles.shelfBadgeText}>{shelfProducts.length}</Text>
              </View>
            </>
          )}
        </View>

        {isEditMode && isOwnShop && !isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.editShelfButton}
              onPress={() => handleEditShelf(shelf.id, shelfName)}
            >
              <Text style={styles.editShelfText}>
                {t('producer.edit_shelf', 'Edit Shelf')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteShelf}
              onPress={() => handleDeleteShelf(shelf.id, shelfName)}
            >
              <Text style={styles.deleteShelfText}>
                {t('producer.delete_shelf', 'Delete Shelf')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addProduct}
              onPress={() => handleAddProduct(shelf.id, shelfName)}
            >
              <Text style={styles.addProductText}>
                {t('producer.add_product', 'Add Product')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsScrollContainer}
        >
          {shelfProducts.map(renderRealProductCard)}
        </ScrollView>
      </View>
    );
  };



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back button for visitors (view mode) */}
        {isViewMode && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#4A4459" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>
          {isViewMode
            ? (externalProducerName || t('producer.shop.producer_shop', 'Boutique'))
            : t('producer.shop.my_shop', 'My Shop')
          }
        </Text>

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

      {/* Loading State */}
      {(isLoadingProfile || isLoadingShopData) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#89A083" />
          <Text style={styles.loadingText}>{t('common.loading', 'Chargement...')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Producer Info */}
          <View style={styles.producerSection}>
            {producerProfile.displayName && (
              <View style={styles.producerInfo}>
                <Text style={styles.producerName}>
                  {producerProfile.displayName}
                </Text>
                {producerProfile.responsibleName && (
                  <Text style={styles.responsibleName}>
                    {producerProfile.responsibleName}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Description */}
          {producerProfile.biography ? (
            <Text style={styles.description}>
              {producerProfile.biography}
            </Text>
          ) : (
            <Text style={[styles.description, styles.noBiography]}>
            Pas de biographie
          </Text>
        )}

        {/* New Shelf Section - Edit Mode Only */}
        {isEditMode && isOwnShop && (
          <View style={styles.newShelfSection}>
            <Text style={styles.newShelfTitle}>{t('producer.new_shelf', 'New Shelf')}</Text>
            <View style={styles.newShelfInput}>
              <TextInput
                style={styles.shelfInput}
                placeholder={t('producer.shelf_name', 'Shelf Name')}
                value={newShelfName}
                onChangeText={setNewShelfName}
                placeholderTextColor="rgba(74, 68, 89, 0.5)"
                editable={!isCreatingShelf}
              />
              <TouchableOpacity
                style={[styles.addShelfButton, isCreatingShelf && styles.buttonDisabled]}
                onPress={handleAddShelf}
                disabled={isCreatingShelf}
              >
                <Ionicons name="add" size={20} color={isCreatingShelf ? "#999" : "#89A083"} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products and Shelves */}
        <View style={styles.productsSection}>
          {isLoadingShopData ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#4A4459', fontSize: 14 }}>
                {t('common.loading', 'Loading products...')}
              </Text>
            </View>
          ) : shopDataError ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#E07A5F', fontSize: 14 }}>
                {t('common.error', 'Error')}: {shopDataError}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 10, padding: 10, backgroundColor: '#89A083', borderRadius: 8 }}
                onPress={refreshData}
              >
                <Text style={{ color: '#FFFFFF' }}>
                  {t('common.retry', 'Retry')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : shelves.length > 0 ? (
            // Afficher les vraies données du backend
            shelves.map(renderShelf)
          ) : (
            // Pas de produits
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#4A4459', fontSize: 14, textAlign: 'center' }}>
                {t('producer.no_products', 'No products yet. Start by adding your first product!')}
              </Text>
            </View>
          )}
        </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4459",
    flex: 1,
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
  noBiography: {
    color: "#999999",
    fontStyle: "italic",
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A4459',
    fontWeight: '500',
  },

  // Products section
  productsSection: {
    paddingHorizontal: 24,
  },
  shelfSection: {
    marginBottom: 32,
  },
  shelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  shelfTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4459",
  },
  shelfBadge: {
    backgroundColor: "#EAE9E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  shelfBadgeText: {
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
    overflow: "hidden",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
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
  deleteShelf: {
    backgroundColor: "#fcdcdc",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  deleteShelfText: {
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
  editShelfButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  editShelfText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  editShelfNameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editShelfNameInput: {
    flex: 1,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4459",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  cancelShelfButton: {
    width: 36,
    height: 36,
    backgroundColor: "#E07A5F",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  validateShelfButton: {
    width: 36,
    height: 36,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  newShelfSection: {
    backgroundColor: "#EAE9E1",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  newShelfTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 12,
  },
  newShelfInput: {
    flexDirection: "row",
    gap: 8,
  },
  shelfInput: {
    flex: 1,
    height: 37,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#4A4459",
  },
  addShelfButton: {
    width: 48,
    height: 37,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
