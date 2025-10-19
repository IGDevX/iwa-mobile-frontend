import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock data for visualizations
const mockAnalyticsData = {
  totalOrders: 47,
  toDeliver7d: 8,
  paidOrders: 32,
  unpaidOrders: 15,
  ordersPerDay: [
    { day: 'Mon', orders: 4 },
    { day: 'Tue', orders: 7 },
    { day: 'Wed', orders: 6 },
    { day: 'Thu', orders: 9 },
    { day: 'Fri', orders: 8 },
    { day: 'Sat', orders: 5 },
    { day: 'Sun', orders: 8 }
  ],
  ordersByStatus: {
    accepted: 25,
    delivered: 18,
    paid: 32,
    pending: 12,
    refused: 5
  },
  revenueEvolution: [
    { day: 'Mon', revenue: 420 },
    { day: 'Tue', revenue: 680 },
    { day: 'Wed', revenue: 590 },
    { day: 'Thu', revenue: 750 },
    { day: 'Fri', revenue: 640 },
    { day: 'Sat', revenue: 480 },
    { day: 'Sun', revenue: 720 }
  ],
  upcomingDeliveries: [
    { restaurant: 'Le Petit Bistro', date: '2024-09-28', time: '14:30', amount: 120 },
    { restaurant: 'La Table Verte', date: '2024-09-29', time: '10:00', amount: 85 },
    { restaurant: 'Restaurant du Marché', date: '2024-09-30', time: '16:00', amount: 340 }
  ]
};

export default function ProducerDashboard() {
  const { t } = useTranslation();

  const handleOrdersPress = () => {
    router.push('/order/orders-list');
  };

  const renderBarChart = (data: any[], maxValue: number) => {
    return (
      <View style={styles.barChart}>
        {data.map((item, index) => {
          const height = (item.orders / maxValue) * 120;
          return (
            <View key={index} style={styles.barItem}>
              <View style={[styles.bar, { height }]} />
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPieChart = () => {
    const total = Object.values(mockAnalyticsData.ordersByStatus).reduce((a: any, b: any) => a + b, 0);
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <Text style={styles.pieChartText}>Orders</Text>
          <Text style={styles.pieChartTotal}>{total}</Text>
        </View>
        <View style={styles.legend}>
          {Object.entries(mockAnalyticsData.ordersByStatus).map(([status, value]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getStatusColor(status) }]} />
              <Text style={styles.legendText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#89a083ff';
      case 'delivered': return '#3B82F6';
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'refused': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderRevenueChart = () => {
    const maxRevenue = Math.max(...mockAnalyticsData.revenueEvolution.map(item => item.revenue));
    return (
      <View style={styles.revenueChart}>
        {mockAnalyticsData.revenueEvolution.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 120;
          return (
            <View key={index} style={styles.revenueBarItem}>
              <View style={[styles.revenueBar, { height }]} />
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('dashboard.analytics')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={handleOrdersPress}
        >
          <Text style={styles.tabText}>
            {t('dashboard.orders')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, styles.activeTab]}
        >
          <Text style={[styles.tabText, styles.activeTabText]}>
            {t('dashboard.analytics')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardContainer}>
          {/* Analytics Cards Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="receipt-outline" size={20} color="#4A4459" />
                <Text style={styles.metricLabel}>{t('dashboard.total_orders')}</Text>
              </View>
              <Text style={styles.metricValue}>{mockAnalyticsData.totalOrders}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="time-outline" size={20} color="#4A4459" />
                <Text style={styles.metricLabel}>To Deliver (7d)</Text>
              </View>
              <Text style={styles.metricValue}>{mockAnalyticsData.toDeliver7d}</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.metricLabel}>Paid Orders</Text>
              </View>
              <Text style={styles.metricValue}>{mockAnalyticsData.paidOrders}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.metricLabel}>Unpaid Orders</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#EF4444' }]}>{mockAnalyticsData.unpaidOrders}</Text>
            </View>
          </View>

          {/* Orders per Day Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Orders per Day (Last 7 days)</Text>
            <View style={styles.chartContainer}>
              {renderBarChart(mockAnalyticsData.ordersPerDay, 12)}
            </View>
          </View>

          {/* Orders by Status Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Orders by Status</Text>
            <View style={styles.chartContainer}>
              {renderPieChart()}
            </View>
          </View>

          {/* Revenue Evolution Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue Evolution (€)</Text>
            <View style={styles.chartContainer}>
              {renderRevenueChart()}
            </View>
          </View>

          {/* Upcoming Deliveries */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Upcoming Deliveries</Text>
            <View style={styles.deliveriesList}>
              {mockAnalyticsData.upcomingDeliveries.map((delivery, index) => (
                <View key={index} style={styles.deliveryItem}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryRestaurant}>{delivery.restaurant}</Text>
                    <Text style={styles.deliveryDate}>{delivery.date} at {delivery.time}</Text>
                  </View>
                  <Text style={styles.deliveryAmount}>{delivery.amount} €</Text>
                </View>
              ))}
            </View>
          </View>
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

  // Tabs
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

  // Content
  content: {
    flex: 1,
  },

  // Dashboard Styles
  dashboardContainer: {
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A4459",
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 16,
  },
  chartContainer: {
    minHeight: 150,
  },
  
  // Bar Chart Styles
  barChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingBottom: 20,
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    backgroundColor: "#89a083ff",
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#4A4459",
    textAlign: "center",
  },
  
  // Revenue Chart Styles
  revenueChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingBottom: 20,
  },
  revenueBarItem: {
    alignItems: "center",
    flex: 1,
  },
  revenueBar: {
    backgroundColor: "#3B82F6",
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  
  // Pie Chart Styles
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 150,
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  pieChartText: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.6,
  },
  pieChartTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4459",
  },
  legend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#4A4459",
  },
  
  // Deliveries List Styles
  deliveriesList: {
    gap: 12,
  },
  deliveryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE9E1",
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryRestaurant: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
  },
  deliveryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4459",
  },
});
