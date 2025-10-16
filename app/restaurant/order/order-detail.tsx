import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  total: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  producerName: string;
  producerAddress: string;
  total: number;
  status: 'accepted' | 'pending' | 'delivered' | 'paid' | 'unpaid' | 'not_delivered';
  deliveryMode: 'pickup' | 'delivery';
  orderDate: string;
  acceptedDate: string;
  deliveryDate: string;
  paymentDue: string;
  items: OrderItem[];
  deliveryFee: number;
  subtotal: number;
}

const mockOrderDetails: OrderDetails = {
  id: '2',
  orderNumber: 'ORD-2024-001234',
  producerName: 'Ferme Bio Du Soleil',
  producerAddress: '15 Rue des Tomates, Loupian',
  total: 93.90,
  status: 'delivered',
  deliveryMode: 'delivery',
  orderDate: '2024-09-26 10:30',
  acceptedDate: '2024-09-26 11:15',
  deliveryDate: '2024-09-28 14:30',
  paymentDue: '2024-10-05',
  subtotal: 78.90,
  deliveryFee: 15.00,
  items: [
    { id: '1', name: 'Organic Tomatoes', quantity: 5, price: 4.50, unit: 'kg', total: 22.50 },
    { id: '2', name: 'Fresh Basil', quantity: 200, price: 12.00, unit: 'g', total: 12.00 },
    { id: '3', name: 'Mozzarella di Bufala', quantity: 2, price: 18.00, unit: 'kg', total: 36.00 },
    { id: '4', name: 'Organic Lettuce', quantity: 3, price: 2.80, unit: 'heads', total: 8.40 }
  ]
};

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // In a real app, you would fetch order details based on orderId
  const orderDetails = mockOrderDetails;

  const handleBack = () => {
    router.back();
  };

  const getStatusStyle = (status: OrderDetails['status']) => {
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

  const handleCallProducer = () => {
    const phoneNumber = '+33123456789'; // Mock phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailProducer = () => {
    const email = 'contact@fermebiousoleil.fr'; // Mock email
    Linking.openURL(`mailto:${email}`);
  };

  const handlePayNow = () => {
    Alert.alert(
      t('order_detail.payment_title'),
      t('order_detail.payment_message'),
      [
        { text: t('common.ok'), style: 'default' }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('order_detail.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Producer Info */}
        <View style={styles.section}>
          <Text style={styles.producerName}>{orderDetails.producerName}</Text>
          <Text style={styles.orderNumber}>{orderDetails.orderNumber}</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{orderDetails.producerAddress}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order_detail.payment_information')}</Text>
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentIcon}>⚠️</Text>
              <Text style={styles.paymentDueText}>
                {t('order_detail.payment_due', { date: formatPaymentDate(orderDetails.paymentDue) })}
              </Text>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
              <Text style={styles.payButtonText}>{t('order_detail.pay_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order_detail.order_information')}</Text>
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order_detail.order_placed_on')}:</Text>
              <Text style={styles.infoValue}>{formatDate(orderDetails.orderDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order_detail.order_accepted_on')}:</Text>
              <Text style={styles.infoValue}>{formatDate(orderDetails.acceptedDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order_detail.delivery_date_time')}:</Text>
              <Text style={styles.infoValue}>{formatDate(orderDetails.deliveryDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order_detail.delivery_mode')}:</Text>
              <Text style={styles.infoValue}>
                {orderDetails.deliveryMode === 'pickup' 
                  ? t('orders.pickup_at_farm')
                  : t('orders.at_restaurant')
                }
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.infoLabel}>{t('order_detail.order_status')}:</Text>
              <View style={[styles.statusBadge, getStatusStyle(orderDetails.status)]}>
                <Text style={[styles.statusText, { color: getStatusStyle(orderDetails.status).color }]}>
                  {t(`orders.status.${orderDetails.status}`)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order_detail.order_content')}</Text>
          <View style={styles.orderItems}>
            {orderDetails.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit} × {item.price.toFixed(2)} €
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{item.total.toFixed(2)} €</Text>
              </View>
            ))}
            
            <View style={styles.deliveryFeeRow}>
              <Text style={styles.deliveryFeeLabel}>{t('order_detail.delivery_fees')}</Text>
              <Text style={styles.deliveryFeeAmount}>{orderDetails.deliveryFee.toFixed(2)} €</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('order_detail.grand_total')}</Text>
              <Text style={styles.totalAmount}>{orderDetails.total.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order_detail.quick_actions')}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallProducer}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>{t('order_detail.call_producer')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmailProducer}>
              <Text style={styles.actionIcon}>✉️</Text>
              <Text style={styles.actionText}>{t('order_detail.email_producer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: "#F7F6ED",
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#4A4459",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A4459",
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },

  // Section
  section: {
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

  // Producer Info
  producerName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  addressText: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
    flex: 1,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 12,
  },

  // Payment
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentDueText: {
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
  },
  payButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  payButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  // Info Rows
  infoRows: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#4A4459",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  // Order Items
  orderItems: {
    gap: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE9E1",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
  },
  itemTotal: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
  deliveryFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE9E1",
  },
  deliveryFeeLabel: {
    fontSize: 16,
    color: "#89A083",
    fontWeight: "600",
  },
  deliveryFeeAmount: {
    fontSize: 16,
    color: "#89A083",
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#89A083",
  },
  totalLabel: {
    fontSize: 20,
    color: "#4A4459",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    color: "#4A4459",
    fontWeight: "600",
  },

  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#EAE9E1",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
});
