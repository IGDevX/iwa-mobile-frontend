import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

interface AddProductFormData {
  title: string;
  image: string | null;
  saleType: 'weight' | 'unit';
  pricePerKg: string;
  availableQuantity: string;
  deliveryMode: 'delivery' | 'pickup';
  isFresh: boolean;
  certifications: string[];
  origin: string;
}

export default function AddProductScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const categoryName = params.categoryName as string || '';

  const [formData, setFormData] = useState<AddProductFormData>({
    title: '',
    image: null,
    saleType: 'weight',
    pricePerKg: '0.00',
    availableQuantity: '0',
    deliveryMode: 'delivery',
    isFresh: false,
    certifications: [],
    origin: '',
  });

  const certificationOptions = [
    'Bio',
    'Label Rouge',
    'AOP',
    'IGP',
    'Demeter',
    'Nature & Progrès'
  ];

  const handleBack = () => {
    router.back();
  };

  const handleImageUpload = () => {
    Alert.alert(
      t('product.add.image_upload', 'Add Photo'),
      t('product.add.image_upload_message', 'Photo upload functionality will be implemented'),
      [{ text: t('common.ok', 'OK') }]
    );
  };

  const toggleCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert(
        t('common.error', 'Error'),
        t('product.add.validation.title_required', 'Product title is required'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    if (!formData.origin.trim()) {
      Alert.alert(
        t('common.error', 'Error'),
        t('product.add.validation.origin_required', 'Product origin is required'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    Alert.alert(
      t('product.add.success.title', 'Product Added'),
      t('product.add.success.message', 'Product has been successfully added to {{category}}', { category: categoryName }),
      [
        {
          text: t('common.ok', 'OK'),
          onPress: () => router.back()
        }
      ]
    );
  };

  const renderRadioButton = (
    value: string,
    selectedValue: string,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.radioOption} onPress={onPress}>
      <View style={[styles.radioButton, value === selectedValue && styles.radioButtonSelected]}>
        {value === selectedValue && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderCheckbox = (
    value: string,
    isSelected: boolean,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.checkboxOption} onPress={onPress}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#4A4459" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('product.add.title', 'Ajouter un produit')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Title */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.product_title', 'Titre du produit')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('product.add.title_placeholder', 'ex: Tomates anciennes')}
            placeholderTextColor="rgba(74, 68, 89, 0.5)"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
        </View>

        {/* Product Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.product_photo', 'Photo du produit')}</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={handleImageUpload}>
            <Ionicons name="camera" size={40} color="#89A083" />
            <Text style={styles.imageUploadText}>
              {t('product.add.photo_upload', 'Appuyez pour ajouter une photo')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sale Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.sale_type', 'Type de vente')}</Text>
          <View style={styles.radioGroup}>
            {renderRadioButton(
              'weight',
              formData.saleType,
              t('product.add.by_weight', 'Au poids (kg, litres)'),
              () => setFormData(prev => ({ ...prev, saleType: 'weight' }))
            )}
            {renderRadioButton(
              'unit',
              formData.saleType,
              t('product.add.by_unit', 'À l\'unité (pièce, botte)'),
              () => setFormData(prev => ({ ...prev, saleType: 'unit' }))
            )}
          </View>
        </View>

        {/* Price and Quantity */}
        <View style={styles.priceSection}>
          <View style={styles.priceField}>
            <Text style={styles.fieldLabel}>
              {formData.saleType === 'weight' 
                ? t('product.add.price_per_kg', 'Prix par kg/L')
                : t('product.add.price_per_unit', 'Prix par unité')
              }
            </Text>
            <View style={styles.priceInput}>
              <TextInput
                style={styles.priceTextInput}
                value={formData.pricePerKg}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pricePerKg: text }))}
                placeholder="0.00"
                placeholderTextColor="rgba(74, 68, 89, 0.5)"
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencySymbol}>€</Text>
            </View>
          </View>

          <View style={styles.priceField}>
            <Text style={styles.fieldLabel}>{t('product.add.available_quantity', 'Quantité disponible')}</Text>
            <View style={styles.priceInput}>
              <TextInput
                style={styles.priceTextInput}
                value={formData.availableQuantity}
                onChangeText={(text) => setFormData(prev => ({ ...prev, availableQuantity: text }))}
                placeholder="0"
                placeholderTextColor="rgba(74, 68, 89, 0.5)"
                keyboardType="numeric"
              />
              <Text style={styles.currencySymbol}>
                {formData.saleType === 'weight' ? 'kg/L' : 'unités'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.delivery_mode', 'Mode de livraison')}</Text>
          <View style={styles.radioGroup}>
            {renderRadioButton(
              'delivery',
              formData.deliveryMode,
              t('product.add.restaurant_delivery', 'Livraison au restaurant'),
              () => setFormData(prev => ({ ...prev, deliveryMode: 'delivery' }))
            )}
            {renderRadioButton(
              'pickup',
              formData.deliveryMode,
              t('product.add.farm_pickup', 'Retrait à la ferme'),
              () => setFormData(prev => ({ ...prev, deliveryMode: 'pickup' }))
            )}
          </View>
        </View>

        {/* Fresh Product Toggle */}
        <View style={styles.toggleSection}>
          <Text style={styles.sectionLabel}>{t('product.add.fresh_product', 'Produit frais ?')}</Text>
          <Switch
            value={formData.isFresh}
            onValueChange={(value) => setFormData(prev => ({ ...prev, isFresh: value }))}
            trackColor={{ false: '#CBCED4', true: '#89A083' }}
            thumbColor="#fff"
          />
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.certifications', 'Certifications / Labels')}</Text>
          <View style={styles.checkboxGroup}>
            {certificationOptions.map((cert) => 
              renderCheckbox(
                cert,
                formData.certifications.includes(cert),
                cert,
                () => toggleCertification(cert)
              )
            )}
          </View>
        </View>

        {/* Origin */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('product.add.origin', 'Provenance / Lieu')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('product.add.origin_placeholder', 'ex: Montpellier, Hérault')}
            placeholderTextColor="rgba(74, 68, 89, 0.5)"
            value={formData.origin}
            onChangeText={(text) => setFormData(prev => ({ ...prev, origin: text }))}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {t('product.add.save', 'Enregistrer le produit')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6ED',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F7F6ED',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4459',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#4A4459',
    marginBottom: 8,
    lineHeight: 20,
  },
  textInput: {
    height: 50,
    backgroundColor: '#EAE9E1',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#4A4459',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  imageUpload: {
    height: 120,
    backgroundColor: '#EAE9E1',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#89A083',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  imageUploadText: {
    fontSize: 12,
    color: '#4A4459',
    textAlign: 'center',
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBCED4',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#89A083',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#89A083',
  },
  radioLabel: {
    fontSize: 14,
    color: '#4A4459',
    lineHeight: 20,
  },
  priceSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  priceField: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#4A4459',
    lineHeight: 21,
  },
  priceInput: {
    height: 50,
    backgroundColor: '#EAE9E1',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#4A4459',
  },
  currencySymbol: {
    fontSize: 14,
    color: '#4A4459',
    fontWeight: '500',
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#F3F3F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxSelected: {
    backgroundColor: '#89A083',
    borderColor: '#89A083',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4A4459',
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: '#F7F6ED',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 68, 89, 0.1)',
    paddingHorizontal: 30,
    paddingTop: 31,
    paddingBottom: 30,
  },
  saveButton: {
    height: 55,
    backgroundColor: '#89A083',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFEF4',
    fontWeight: '600',
    lineHeight: 32,
  },
});
