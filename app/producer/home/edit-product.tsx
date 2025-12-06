/**
 * Edit Product Screen
 *
 * Page pour modifier un produit existant avec possibilité de changer l'image
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  View,
} from 'react-native';
import { AuthContext } from '../../../components/AuthContext';
import { uploadProductImage } from '../../../services/image';
import {
  updateProduct,
  getAllCategories,
  getAllCertifications,
  getAllCurrencies,
  getAllUnits,
  type CategoryResponse,
  type CurrencyResponse,
  type ProductCertificationResponse,
  type UnitResponse,
} from '../../../services/shop';

export default function EditProductScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { state: authState } = useContext(AuthContext);

  // Parse product data from params
  const productData = params.product ? JSON.parse(params.product as string) : null;

  // Form state - Pré-remplir avec les données existantes
  const [title, setTitle] = useState(productData?.title || '');
  const [description, setDescription] = useState(productData?.description || '');
  const [price, setPrice] = useState(productData?.price?.toString() || '');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(productData?.currency?.id || null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(productData?.unit?.id || null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(productData?.category?.id || null);
  const [selectedCertifications, setSelectedCertifications] = useState<number[]>(
    productData?.certifications?.map((c: any) => c.id) || []
  );
  const [isFresh, setIsFresh] = useState(productData?.isFresh || false);
  const [imageUri, setImageUri] = useState<string | null>(productData?.mainImageUrl || null);
  const [imageFile, setImageFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  // Reference data
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [certifications, setCertifications] = useState<ProductCertificationResponse[]>([]);

  // Shelf info (read-only depuis product data)
  const [shelfName] = useState<string>(productData?.shelf?.label || '');

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dropdown expansion states
  const [expandCurrency, setExpandCurrency] = useState(false);
  const [expandUnit, setExpandUnit] = useState(false);
  const [expandCategory, setExpandCategory] = useState(false);

  // Load reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  async function loadReferenceData() {
    try {
      setIsLoadingData(true);

      const [currenciesData, unitsData, categoriesData, certificationsData] = await Promise.all([
        getAllCurrencies(),
        getAllUnits(),
        getAllCategories(),
        getAllCertifications(),
      ]);

      setCurrencies(currenciesData);
      setUnits(unitsData);
      setCategories(categoriesData);
      setCertifications(certificationsData);
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        t('producer.error_loading_data', 'Failed to load reference data')
      );
    } finally {
      setIsLoadingData(false);
    }
  }

  // Pick image from gallery
  async function handlePickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('common.error', 'Error'), t('producer.permission_required', 'Permission to access gallery is required'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);

      // Prepare file object for upload
      const fileName = asset.uri.split('/').pop() || 'product-image.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      setImageFile({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
    }
  }

  // Remove selected image
  function handleRemoveImage() {
    setImageUri(null);
    setImageFile(null);
  }

  // Toggle certification selection
  function toggleCertification(certificationId: number) {
    if (selectedCertifications.includes(certificationId)) {
      setSelectedCertifications(selectedCertifications.filter(id => id !== certificationId));
    } else {
      setSelectedCertifications([...selectedCertifications, certificationId]);
    }
  }

  // Validate form
  function validateForm(): boolean {
    if (!title.trim()) {
      Alert.alert(t('common.error', 'Error'), t('producer.title_required', 'Product title is required'));
      return false;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert(t('common.error', 'Error'), t('producer.valid_price_required', 'Please enter a valid price'));
      return false;
    }

    if (!selectedCurrencyId) {
      Alert.alert(t('common.error', 'Error'), t('producer.currency_required', 'Please select a currency'));
      return false;
    }

    if (!selectedUnitId) {
      Alert.alert(t('common.error', 'Error'), t('producer.unit_required', 'Please select a unit'));
      return false;
    }

    if (!selectedCategoryId) {
      Alert.alert(t('common.error', 'Error'), t('producer.category_required', 'Please select a category'));
      return false;
    }

    return true;
  }

  // Handle product update
  async function handleUpdateProduct() {
    if (!validateForm()) return;

    setIsUpdating(true);

    try {
      let mainImageId: string | undefined = productData?.mainImageId;
      let mainImageUrl: string | undefined = productData?.mainImageUrl;

      // Step 1: Upload new image if selected
      if (imageFile && productData?.id) {
        try {
          console.log('📸 [EDIT-PRODUCT] Uploading new image...');
          console.log('📸 [EDIT-PRODUCT] Product ID:', productData.id);
          console.log('📸 [EDIT-PRODUCT] User ID:', authState.userInfo?.sub);

          const uploadResponse = await uploadProductImage(
            imageFile,
            productData.id.toString(),
            authState.userInfo?.sub || 'unknown'
          );

          console.log('✅ [EDIT-PRODUCT] Upload successful:', uploadResponse);
          console.log('📸 [EDIT-PRODUCT] Image data extracted:', {
            imageId: uploadResponse.imageId,
            imageUrl: uploadResponse.url
          });

          mainImageId = uploadResponse.imageId;
          mainImageUrl = uploadResponse.url;
        } catch (uploadError) {
          console.error('❌ [EDIT-PRODUCT] Image upload error:', uploadError);
          Alert.alert(
            t('producer.warning', 'Warning'),
            t('producer.image_upload_failed', 'Failed to upload image, product will be updated without new image')
          );
        }
      } else if (!imageFile) {
        console.log('ℹ️ [EDIT-PRODUCT] No new image selected, keeping existing image');
      }

      // Step 2: Update product
      const updateData = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        currencyId: selectedCurrencyId!,
        unitId: selectedUnitId!,
        shelfId: productData?.shelf?.id,
        categoryId: selectedCategoryId!,
        certificationIds: selectedCertifications.length > 0 ? selectedCertifications : undefined,
        isFresh,
        mainImageId,
        mainImageUrl,
        producerId: productData?.producerId,
      };

      console.log('📦 [EDIT-PRODUCT] Updating product with data:');
      console.log('  - Product ID:', productData.id);
      console.log('  - Title:', updateData.title);
      console.log('  - mainImageId:', updateData.mainImageId);
      console.log('  - mainImageUrl:', updateData.mainImageUrl);
      console.log('  - Full data:', JSON.stringify(updateData, null, 2));

      await updateProduct(productData.id, updateData);

      console.log('✅ [EDIT-PRODUCT] Product updated successfully');

      // Naviguer en arrière immédiatement
      router.back();

      // Afficher le message de succès après navigation
      setTimeout(() => {
        Alert.alert(
          t('producer.success', 'Success'),
          t('producer.product_updated', 'Product updated successfully!')
        );
      }, 300);
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        t('producer.product_update_failed', 'Failed to update product. Please try again.')
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#89A083" />
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4A4459" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('producer.edit_product', 'Edit Product')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('producer.product_image', 'Product Image')}</Text>
          <View style={styles.imageUploadContainer}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                  <Ionicons name="close-circle" size={30} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
                <Ionicons name="camera" size={40} color="#89A083" />
                <Text style={styles.imagePlaceholderText}>{t('producer.add_image', 'Add Image')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('producer.basic_info', 'Basic Information')}</Text>

          <Text style={styles.label}>{t('producer.product_title', 'Title')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t('producer.product_title_placeholder', 'e.g., Organic Tomatoes')}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="rgba(74, 68, 89, 0.5)"
          />

          <Text style={styles.label}>{t('producer.description', 'Description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('producer.description_placeholder', 'Product description...')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="rgba(74, 68, 89, 0.5)"
          />

          <Text style={styles.label}>{t('producer.price', 'Price')} *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="rgba(74, 68, 89, 0.5)"
          />
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('producer.product_details', 'Product Details')}</Text>

          {/* Currency Dropdown */}
          <Text style={styles.label}>{t('producer.currency', 'Currency')} *</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setExpandCurrency(!expandCurrency)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedCurrencyId
                  ? `${currencies.find(c => c.id === selectedCurrencyId)?.label} (${currencies.find(c => c.id === selectedCurrencyId)?.code})`
                  : t('producer.select_currency', 'Select currency')}
              </Text>
              <Ionicons name={expandCurrency ? "chevron-up" : "chevron-down"} size={20} color="#4A4459" />
            </TouchableOpacity>
            {expandCurrency && (
              <View style={styles.dropdownList}>
                <ScrollView nestedScrollEnabled={true} style={styles.dropdownScrollView}>
                  {currencies.map((currency) => (
                    <TouchableOpacity
                      key={currency.id}
                      style={[
                        styles.dropdownItem,
                        selectedCurrencyId === currency.id && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCurrencyId(currency.id);
                        setExpandCurrency(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {currency.label} ({currency.code})
                      </Text>
                      {selectedCurrencyId === currency.id && (
                        <Ionicons name="checkmark" size={20} color="#89A083" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Unit Dropdown */}
          <Text style={styles.label}>{t('producer.unit', 'Unit')} *</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setExpandUnit(!expandUnit)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedUnitId
                  ? `${units.find(u => u.id === selectedUnitId)?.label} (${units.find(u => u.id === selectedUnitId)?.code})`
                  : t('producer.select_unit', 'Select unit')}
              </Text>
              <Ionicons name={expandUnit ? "chevron-up" : "chevron-down"} size={20} color="#4A4459" />
            </TouchableOpacity>
            {expandUnit && (
              <View style={styles.dropdownList}>
                <ScrollView nestedScrollEnabled={true} style={styles.dropdownScrollView}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit.id}
                      style={[
                        styles.dropdownItem,
                        selectedUnitId === unit.id && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedUnitId(unit.id);
                        setExpandUnit(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {unit.label} ({unit.code})
                      </Text>
                      {selectedUnitId === unit.id && (
                        <Ionicons name="checkmark" size={20} color="#89A083" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Shelf (read-only, depuis product data) */}
          <Text style={styles.label}>{t('producer.shelf', 'Shelf')} *</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyFieldText}>{shelfName || t('producer.no_shelf', 'No shelf selected')}</Text>
          </View>

          {/* Category Dropdown */}
          <Text style={styles.label}>{t('producer.category', 'Category')} *</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setExpandCategory(!expandCategory)}
            >
              <Text style={styles.dropdownButtonText}>
                {selectedCategoryId
                  ? categories.find(c => c.id === selectedCategoryId)?.name
                  : t('producer.select_category', 'Select category')}
              </Text>
              <Ionicons name={expandCategory ? "chevron-up" : "chevron-down"} size={20} color="#4A4459" />
            </TouchableOpacity>
            {expandCategory && (
              <View style={styles.dropdownList}>
                <ScrollView nestedScrollEnabled={true} style={styles.dropdownScrollView}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.dropdownItem,
                        selectedCategoryId === category.id && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(category.id);
                        setExpandCategory(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{category.name}</Text>
                      {selectedCategoryId === category.id && (
                        <Ionicons name="checkmark" size={20} color="#89A083" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Fresh Product Toggle */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t('producer.is_fresh', 'Fresh Product')}</Text>
            <Switch
              value={isFresh}
              onValueChange={setIsFresh}
              trackColor={{ false: '#757575', true: '#89A083' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('producer.certifications', 'Certifications')}</Text>
          <View style={styles.certificationsContainer}>
            {certifications.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                style={[
                  styles.certificationChip,
                  selectedCertifications.includes(cert.id) && styles.certificationChipSelected,
                ]}
                onPress={() => toggleCertification(cert.id)}
              >
                <Text
                  style={[
                    styles.certificationChipText,
                    selectedCertifications.includes(cert.id) && styles.certificationChipTextSelected,
                  ]}
                >
                  {cert.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.createButton, isUpdating && styles.createButtonDisabled]}
          onPress={handleUpdateProduct}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>{t('producer.update_product', 'Update Product')}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6ED',
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F6ED',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A4459',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4459',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4459',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4459',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A4459',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAE9E1',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EAE9E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#4A4459',
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#EAE9E1',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6ED',
  },
  dropdownItemSelected: {
    backgroundColor: '#F7F6ED',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#4A4459',
  },
  readOnlyField: {
    backgroundColor: '#EAE9E1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0CFC1',
  },
  readOnlyFieldText: {
    fontSize: 16,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EAE9E1',
  },
  imageUploadContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EAE9E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#89A083',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#89A083',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  certificationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EAE9E1',
    borderWidth: 1,
    borderColor: '#EAE9E1',
  },
  certificationChipSelected: {
    backgroundColor: '#89A083',
    borderColor: '#89A083',
  },
  certificationChipText: {
    fontSize: 14,
    color: '#4A4459',
    fontWeight: '500',
  },
  certificationChipTextSelected: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#89A083',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

