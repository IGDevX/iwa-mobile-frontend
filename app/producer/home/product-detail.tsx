/**
 * Product Detail Screen
 *
 * Affiche les détails complets d'un produit
 * - Informations du produit (titre, description, prix, etc.)
 * - Image du produit
 * - Catégorie, unité, certifications
 * - Actions: Edit (si producteur), Add to cart (si client)
 */

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../components/AuthContext';
import { getProduct, type ProductResponse } from '../../../services/shop';
import { useTranslation } from 'react-i18next';

export default function ProductDetailScreen() {
  const { id, isOwner } = useLocalSearchParams<{ id: string; isOwner: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProductOwner = isOwner === 'true';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 [PRODUCT-DETAIL] Loading product:', id);

      const data = await getProduct(Number(id));
      console.log('✅ [PRODUCT-DETAIL] Product loaded:', data);
      setProduct(data);
    } catch (err) {
      console.error('❌ [PRODUCT-DETAIL] Error loading product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!product) return;

    console.log('✏️ [PRODUCT-DETAIL] Navigating to edit with product data:', product);
    router.push({
      pathname: '/producer/home/edit-product',
      params: {
        productId: id,
        product: JSON.stringify(product)
      },
    });
  };

  const handleAddToCart = () => {
    // TODO: Implémenter l'ajout au panier
    Alert.alert(
      t('cart.added', 'Added to cart'),
      t('cart.product_added', 'Product added to your cart!')
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#89A083" />
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ff4444" />
        <Text style={styles.errorText}>{error || t('product.not_found', 'Product not found')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('common.go_back', 'Go Back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#4A4459" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
        {isProductOwner && (
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color="#89A083" />
          </TouchableOpacity>
        )}
        {!isProductOwner && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.mainImageUrl ? (
            <Image
              source={{ uri: product.mainImageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={80} color="#D0CFC1" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Title and Fresh Badge */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{product.title}</Text>
            {product.isFresh && (
              <View style={styles.freshBadge}>
                <Ionicons name="leaf" size={16} color="#FFFFFF" />
                <Text style={styles.freshText}>{t('product.fresh', 'Fresh')}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {product.price} {product.currency.code}
            </Text>
            <Text style={styles.unit}>/ {product.unit.label}</Text>
          </View>

          {/* Category */}
          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={20} color="#89A083" />
            <Text style={styles.detailLabel}>{t('product.category', 'Category')}:</Text>
            <Text style={styles.detailValue}>{product.category.name}</Text>
          </View>

          {/* Shelf */}
          <View style={styles.detailRow}>
            <Ionicons name="folder" size={20} color="#89A083" />
            <Text style={styles.detailLabel}>{t('product.shelf', 'Shelf')}:</Text>
            <Text style={styles.detailValue}>{product.shelf.label}</Text>
          </View>

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <View style={styles.certificationsContainer}>
              <View style={styles.certificationsHeader}>
                <Ionicons name="ribbon" size={20} color="#89A083" />
                <Text style={styles.certificationsTitle}>
                  {t('product.certifications', 'Certifications')}
                </Text>
              </View>
              <View style={styles.certificationsList}>
                {product.certifications.map((cert) => (
                  <View key={cert.id} style={styles.certificationBadge}>
                    <Text style={styles.certificationText}>{cert.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>
                {t('product.description', 'Description')}
              </Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadataContainer}>
            {product.createdAt && (
              <Text style={styles.metadataText}>
                {t('product.created_at', 'Created')}: {new Date(product.createdAt).toLocaleDateString()}
              </Text>
            )}
            {product.updatedAt && product.updatedAt !== product.createdAt && (
              <Text style={styles.metadataText}>
                {t('product.updated_at', 'Updated')}: {new Date(product.updatedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      {!isProductOwner && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={24} color="#FFFFFF" />
            <Text style={styles.addToCartText}>
              {t('cart.add_to_cart', 'Add to Cart')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A4459',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#89A083',
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE9E1',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4459',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F7F6ED',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAE9E1',
  },
  infoContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4459',
    marginRight: 12,
  },
  freshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#89A083',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  freshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#89A083',
  },
  unit: {
    fontSize: 18,
    color: '#4A4459',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#4A4459',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#4A4459',
  },
  certificationsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  certificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  certificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4459',
  },
  certificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificationBadge: {
    backgroundColor: '#F7F6ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#89A083',
  },
  certificationText: {
    fontSize: 14,
    color: '#4A4459',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#EAE9E1',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4459',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4A4459',
    lineHeight: 24,
  },
  metadataContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#EAE9E1',
  },
  metadataText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAE9E1',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#89A083',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 12,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

