import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

interface Order {
  id: string;
  producerName: string;
  total: number;
  status: 'accepted' | 'pending' | 'delivered' | 'paid' | 'unpaid' | 'not_delivered';
  deliveryMode: 'pickup' | 'delivery';
  date: string;
  time: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    producerName: 'Les Jardins de Marie',
    total: 120,
    status: 'accepted',
    deliveryMode: 'pickup',
    date: '2024-09-28',
    time: '14:00'
  },
  {
    id: '2',
    producerName: 'Ferme Bio du Soleil',
    total: 85,
    status: 'pending',
    deliveryMode: 'delivery',
    date: '2024-09-29',
    time: '10:30'
  },
  {
    id: '3',
    producerName: 'Ferme des Champs',
    total: 240,
    status: 'delivered',
    deliveryMode: 'delivery',
    date: '2024-09-27',
    time: '09:00'
  },
  {
    id: '4',
    producerName: 'Producteur Martin',
    total: 65,
    status: 'paid',
    deliveryMode: 'pickup',
    date: '2024-09-26',
    time: '16:30'
  },
  {
    id: '5',
    producerName: 'Ferme de la Vallée',
    total: 150,
    status: 'unpaid',
    deliveryMode: 'delivery',
    date: '2024-09-26',
    time: '11:00'
  },
  {
    id: '6',
    producerName: 'Les Vergers du Sud',
    total: 95,
    status: 'not_delivered',
    deliveryMode: 'delivery',
    date: '2024-09-25',
    time: '13:30'
  },
  {
    id: '7',
    producerName: 'Ferme Bio Locale',
    total: 78,
    status: 'paid',
    deliveryMode: 'pickup',
    date: '2024-09-24',
    time: '08:45'
  },
  {
    id: '8',
    producerName: 'Maraîcher du Village',
    total: 132,
    status: 'paid',
    deliveryMode: 'delivery',
    date: '2024-09-23',
    time: '15:00'
  }
];

export default function OrdersListScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders] = useState<Order[]>(mockOrders);

  const handleBack = () => {
    router.back();
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
      default:
        return { backgroundColor: '#F3F4F6', color: '#4A4459' };
    }
  };

  const filteredOrders = orders.filter(order =>
    order.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.my_orders')}</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('orders.search_placeholder')}
            placeholderTextColor="#4A4459"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters Button */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filtersButton}>
          <Text style={styles.filtersIcon}>⚙️</Text>
          <Text style={styles.filtersText}>{t('orders.filters')}</Text>
          <Text style={styles.filtersArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => router.push(`/restaurant/order/order-detail?id=${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.producerName}>{order.producerName}</Text>
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
                    : t('orders.at_restaurant')
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
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 29,
    paddingVertical: 23,
    backgroundColor: "#F7F6ED",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A4459",
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAE9E1",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 20,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE9E1",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#4A4459",
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 30,
    marginBottom: 24,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#89A083",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  filtersIcon: {
    fontSize: 16,
  },
  filtersText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  filtersArrow: {
    fontSize: 12,
    color: "#FFFFFF",
  },

  // Content
  content: {
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: 30,
    gap: 16,
  },

  // Order Card
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
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
