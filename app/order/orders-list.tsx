import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext } from '../../components/AuthContext';

interface Order {
  id: string;
  restaurantName?: string; // For producer view
  producerName?: string;   // For restaurant view
  total: number;
  status: 'accepted' | 'pending' | 'delivered' | 'paid' | 'unpaid' | 'not_delivered' | 'refused';
  deliveryMode: 'pickup' | 'delivery';
  date: string;
  time: string;
}

export default function OrdersListScreen() {
  const { t } = useTranslation();
  const { state: authState } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  const isProducer = authState.userInfo?.roles?.[0] === 'Producer';
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const orderApi = await import('../../services/order/orderApi');
        let data;
        if (isProducer) {
          // request producer-specific orders; backend should infer producerId from token
          data = await orderApi.listOrders({ producerId: authState.userInfo?.sub });
        } else {
          data = await orderApi.listOrders({ customerId: authState.userInfo?.sub });
        }
        if (!mounted) return;
        setOrders(Array.isArray(data) ? data : (data.items || []));
      } catch (err: any) {
        console.error('[OrdersList] Failed to load orders', err);
        setError(err?.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isProducer]);

  const handleBack = () => {
    router.back();
  };

  const handleDashboardPress = () => {
    router.push('/producer/home/dashboard');
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'accepted':
        return { backgroundColor: '#DCFCE7', color: '#016630' };
      case 'pending':
        return { backgroundColor: '#FFEDD4', color: '#9F2D00' };
      case 'delivered':
        return { backgroundColor: '#DBEAFE', color: '#193CB8' };
      case 'paid':
        return { backgroundColor: '#D0FAE5', color: '#006045' };
      case 'unpaid':
        return { backgroundColor: '#FFE2E2', color: '#9F0712' };
      case 'not_delivered':
        return { backgroundColor: '#FFE2E2', color: '#9F0712' };
      case 'refused':
        return { backgroundColor: '#FFE2E2', color: '#9F0712' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#4A4459' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchTerm = isProducer ? order.restaurantName : order.producerName;
    return searchTerm?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.headerTitle}>{t('orders.loading', 'Loading orders...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.headerTitle}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.my_orders')}</Text>
      </View>

      {/* Producer Tabs */}
      {isProducer && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              {t('dashboard.orders')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={handleDashboardPress}
          >
            <Text style={styles.tabText}>
              {t('dashboard.analytics')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image
            source={require('../../assets/images/icons8-search-96.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('orders.search_placeholder')}
            placeholderTextColor="#717182"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters Button */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filtersButton}>
          <Ionicons
            name="filter"
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.filtersText}>{t('orders.filters')}</Text>
          <Ionicons name="chevron-down" style={styles.filtersArrow} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/order/order-detail?id=${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.producerName}>
                  {isProducer ? order.restaurantName : order.producerName}
                </Text>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderTotal}>
                    {t('orders.total', { amount: order.total })}
                  </Text>
                  <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                    <Text style={[styles.statusText, { color: getStatusStyle(order.status).color }]}>
                      {t(`orders.status.${order.status}`)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.deliveryMode}>
                  {order.deliveryMode === 'pickup'
                    ? t('orders.pickup_at_farm')
                    : (isProducer ? t('orders.at_restaurant') : t('orders.delivery'))
                  }
                </Text>

                <Text style={styles.orderDateTime}>
                  {order.date} {t('orders.at')} {order.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 19,
    backgroundColor: "#F7F6ED",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 27,
    color: '#4A4459',
    fontWeight: '600',
  },

  // Tabs (Producer only)
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#F7F6ED",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#89a083ff",
    borderRadius: 15,
  },
  tabText: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "#EAE9E1",
    borderColor: "#eae9e1",
    borderWidth: 0,
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 55,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#4A4459",
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#89a083ff",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  filtersIcon: {
    width: 16,
    height: 16,
  },
  filtersText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  filtersArrow: {
    fontSize: 16,
    color: "#FFFFFF",
  },

  // Content
  content: {
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingTop: 5,
  },

  // Order Card
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    marginBottom: 8,
  },
  producerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4459",
  },
  orderDetails: {
    gap: 8,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deliveryMode: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.8,
  },
  orderDateTime: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.8,
  },
});
