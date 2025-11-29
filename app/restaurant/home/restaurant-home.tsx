import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useNotifications } from "../../../hooks/useNotifications";
import { useCategories } from "../../../hooks/useCategories";
import { searchProducts } from "../../../services/shop/shopService";
import type { ProductSearchRequest, ProductResponse } from "../../../services/shop/shopApi";

const ITEMS_PER_PAGE = 20;

export default function RestaurantHomeScreen() {
  const { t } = useTranslation();
  const { hasUnreadNotifications } = useNotifications();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // States for search and filters
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // States for products
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Perform search
  const performSearch = async (page: number = 0, append: boolean = false) => {
    setIsLoadingProducts(true);
    try {
      const searchParams: ProductSearchRequest = {
        page,
        size: ITEMS_PER_PAGE,
      };

      // Add filters only if they are set
      if (searchText.trim()) {
        searchParams.q = searchText.trim();
      }
      if (selectedCategoryId) {
        searchParams.categoryIds = [selectedCategoryId];
      }
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        searchParams.priceMin = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        searchParams.priceMax = parseFloat(maxPrice);
      }

      const response = await searchProducts(searchParams);

      if (append) {
        setProducts((prev) => [...prev, ...response.products]);
      } else {
        setProducts(response.products);
      }

      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('search.error', 'Failed to search products. Please try again.')
      );
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Initial load - show all products
  useEffect(() => {
    performSearch();
  }, []);

  // Trigger search when filters change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      performSearch(0, false);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(delaySearch);
  }, [searchText, selectedCategoryId, minPrice, maxPrice]);

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (currentPage < totalPages - 1 && !isLoadingProducts) {
      performSearch(currentPage + 1, true);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notification');
  };

  const renderProductCard = (product: ProductResponse) => (
    <TouchableOpacity
      key={product.id} 
      style={styles.productCard}
      onPress={() => router.push({
        pathname: '../order/product-detail',
        params: { 
          productId: product.id,
        }
      })}
    >
      <Image
        source={{ uri: product.mainImageUrl || 'https://via.placeholder.com/150?text=No+Image' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.productCategory}>{product.category.name}</Text>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.isFresh && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('product.fresh', 'Fresh')}</Text>
              </View>
            )}
            {product.certifications && product.certifications.slice(0, 2).map((cert) => (
              <View key={cert.id} style={styles.badge}>
                <Text style={styles.badgeText}>{cert.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom info: price */}
        <View style={styles.productFooter}>
          <Text style={styles.priceText}>
            {product.price.toFixed(2)} {product.currency.code}/{product.unit.code}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Montpellier</Text>
        </TouchableOpacity>
        
        <Image source={{ uri: "https://placehold.co/50x50" }} style={styles.profileImage} />
        
        <TouchableOpacity 
          style={styles.notificationButton}
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

      {/* Main ScrollView */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Image
              source={require("../../../assets/images/icons8-search-96.png")}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('home.search_placeholder', 'Search products...')}
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories - Horizontal Scroll */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categoriesLoading ? (
              <ActivityIndicator size="small" color="#89A083" style={{ marginLeft: 16 }} />
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategoryId === cat.id && styles.categoryCardSelected
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                >
                  <Image source={cat.icon} style={styles.categoryIcon} />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategoryId === cat.id && styles.categoryTextSelected
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name || 'No name'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Filters Section - Vinted Style */}
        <View style={styles.filtersWrapper}>
          {/* Filter Selection Buttons - First Line */}
          <View style={styles.filterSelectionRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                (minPrice || maxPrice) && styles.filterButtonActive
              ]}
              onPress={() => setShowFilters(true)}
            >
              <Text style={[
                styles.filterButtonText,
                (minPrice || maxPrice) && styles.filterButtonTextActive
              ]}>
                {t('search.filter.price', 'Fourchette de prix')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={(minPrice || maxPrice) ? "#89A083" : "#4A4459"}
              />
            </TouchableOpacity>
          </View>

          {/* Active Filters Chips - Below Selection */}
          {(selectedCategoryId || minPrice || maxPrice) && (
            <View style={styles.activeFiltersRow}>
              {/* Category Filter Chip */}
              {selectedCategoryId && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCategoryId(null)}>
                    <Ionicons name="close" size={16} color="#89A083" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Price Filter Chip - Without € symbol */}
              {(minPrice || maxPrice) && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    {minPrice && maxPrice
                      ? `${minPrice} - ${maxPrice}`
                      : minPrice
                        ? `De ${minPrice}`
                        : `À ${maxPrice}`
                    }
                  </Text>
                  <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }}>
                    <Ionicons name="close" size={16} color="#89A083" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Products Grid */}
        {isLoadingProducts && currentPage === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#89A083" />
            <Text style={styles.loadingText}>
              {t('common.loading', 'Loading...')}
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {t('search.no_results', 'No products found')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('search.try_different', 'Try adjusting your search or filters')}
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map(renderProductCard)}

            {/* Load More Button */}
            {currentPage < totalPages - 1 && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={isLoadingProducts}
              >
                {isLoadingProducts ? (
                  <ActivityIndicator size="small" color="#89A083" />
                ) : (
                  <Text style={styles.loadMoreText}>
                    {t('search.load_more', 'Load More')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Price Filter Modal - Vinted Style - Outside ScrollView */}
      {showFilters && (
        <View style={styles.priceModal}>
          <TouchableOpacity
            style={styles.priceModalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.priceModalContent}>
                <View style={styles.priceModalHeader}>
                  <Text style={styles.priceModalTitle}>
                    {t('search.filter.price', 'Price')}
                  </Text>
                  <TouchableOpacity onPress={() => setShowFilters(false)}>
                    <Ionicons name="close" size={24} color="#4A4459" />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputGroup}>
                    <Text style={styles.priceInputLabel}>
                      {t('search.filter.min_price', 'From')}
                    </Text>
                    <TextInput
                      style={styles.priceInputField}
                      placeholder="0,00"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.priceInputGroup}>
                    <Text style={styles.priceInputLabel}>
                      {t('search.filter.max_price', 'To')}
                    </Text>
                    <TextInput
                      style={styles.priceInputField}
                      placeholder="0,00"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.priceModalApplyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.priceModalApplyText}>
                    {t('common.apply', 'Apply')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F6ED" 
  },
  
  // Main ScrollView
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header styles - Fixed
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F7F6ED",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 8,
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#4A4459",
  },
  searchText: {
    fontSize: 14, 
    color: "#717182" 
  },

  // Categories Section
  categoriesSection: {
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 90,
    height: 110,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryCardSelected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#89A083",
  },
  categoryIcon: { 
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  categoryText: { 
    fontSize: 11,
    textAlign: "center",
    color: "#4A4459",
    fontWeight: "500",
    lineHeight: 13,
    letterSpacing: -0.2,
    marginTop: 8,
    height: 28,
  },
  categoryTextSelected: {
    color: "#89A083",
    fontWeight: "700",
  },

  filtersArrow: {
    fontSize: 16,
    color: "#000000ff",
  },

  // Filters styles
  filtersContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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

  // Products container
  productsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
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

  // Price Filter Styles
  priceFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#999",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#4A4459",
    paddingVertical: 4,
  },
  priceCurrency: {
    fontSize: 14,
    color: "#999",
    marginLeft: 4,
  },
  priceSeparator: {
    fontSize: 18,
    color: "#999",
  },
  clearButton: {
    backgroundColor: "#FFE0E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#E07A5F",
    fontWeight: "600",
  },

  // Loading and Empty States
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A4459",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
  loadMoreButton: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#89A083",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 16,
    color: "#89A083",
    fontWeight: "600",
  },

  // Filters Wrapper
  filtersWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // Filter Selection Row - First Line (buttons)
  filterSelectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },

  // Active Filters Row - Second Line (selected chips)
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Filter Chip - Selected Filter (Vinted style)
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9", // Pastel green
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#89A083",
  },
  filterChipText: {
    fontSize: 13,
    color: "#89A083",
    fontWeight: "600",
  },

  // Filter Button Active State
  filterButtonActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#89A083",
  },
  filterButtonText: {
    fontSize: 13,
    color: "#4A4459",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#89A083",
    fontWeight: "600",
  },

  // Price Modal - Vinted Style (Overlay)
  priceModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  priceModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  priceModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  priceModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  priceModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4459",
  },
  priceInputsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  priceInputField: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#4A4459",
  },
  priceModalApplyButton: {
    backgroundColor: "#89A083",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  priceModalApplyText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
