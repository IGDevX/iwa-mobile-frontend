import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../components/AuthContext";
import { usePaymentContext } from "../../components/PaymentContext";
import { usePayment } from "../../hooks/usePayment";
import { convertPaymentRecordToRequest, convertPaymentResponseToRecord, getOrderPaymentStatus, recordOrderPayment, updateOrderStatusToPaid } from "../../services/payment";

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
  producerKeycloakId?: string; // Producer's Keycloak ID for payments
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
  producerKeycloakId: '1f40acc3-6fa2-4599-a9ac-184773358935', // ⚠️ TODO: Replace with actual producer Keycloak ID
  total: 93.90,
  status: 'not_delivered',
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
  const { state } = useContext(AuthContext);
  const { addPayment, getPaymentByOrderId, updatePaymentStatus } = usePaymentContext();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // Determine user role
  const userRole = state.userInfo?.roles?.[0] || 'Producer';
  const isRestaurant = userRole === 'Restaurant Owner';

  // In a real app, you would fetch order details based on orderId
  const orderDetails = mockOrderDetails;

  // Check if payment exists for this order
  const existingPayment = getPaymentByOrderId(orderId);
  const isPaid = existingPayment?.status === 'succeeded';

  // Initialize payment hook with producer info for Stripe Connect
  const { loading, openPaymentSheet } = usePayment({
    amount: Math.round(orderDetails.total * 100), // Convert to cents
    currency: 'eur',
    merchantDisplayName: orderDetails.producerName,
    producerKeycloakId: orderDetails.producerKeycloakId, // For direct payment to producer
    orderId: orderDetails.id, // For tracking
  });

  // Load payment status from backend on component mount
  useEffect(() => {
    const loadPaymentStatus = async () => {
      try {
        console.log('[OrderDetail] Loading payment status from backend...');
        const backendPayment = await getOrderPaymentStatus(orderId);
        
        if (backendPayment) {
          // Convert backend response to frontend format and store in context
          const paymentRecord = convertPaymentResponseToRecord(backendPayment);
          addPayment(paymentRecord);
          console.log('[OrderDetail] Payment status loaded from backend:', backendPayment.status);
        } else {
          console.log('[OrderDetail] No payment found for this order');
        }
      } catch (error: any) {
        console.error('[OrderDetail] Failed to load payment status:', error);
        // Don't show error to user - just means no payment exists yet
      }
    };

    if (isRestaurant && orderId) {
      loadPaymentStatus();
    }
  }, [orderId, isRestaurant, addPayment]);

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

  const didTapCheckoutButton = async () => {
    try {
      // Payment will be split automatically by Stripe Connect:
      // - 90% (€84.51) goes directly to producer's connected account
      // - 10% (€9.39) stays with platform as application fee
      // Total charged to customer: €93.90
      const result = await openPaymentSheet();

      if (result.success) {
        // Get payment intent ID from the result
        const paymentIntentId = result.paymentIntentId || 'unknown';
        
        // Create payment record object
        const paymentRecord = {
          paymentId: paymentIntentId,
          orderId: orderId,
          amount: Math.round(orderDetails.total * 100),
          currency: 'eur',
          status: 'succeeded' as const,
          paidBy: state.userInfo?.sub || state.userInfo?.username || 'unknown',
          paidTo: orderDetails.producerName,
          paymentDate: new Date().toISOString(),
          paymentDueDate: orderDetails.paymentDue,
        };

        try {
          // Store in local context first
          addPayment(paymentRecord);

          // Sync with backend
          console.log('[OrderDetail] Syncing payment with backend...');
          const backendPaymentRequest = convertPaymentRecordToRequest(paymentRecord);
          
          // Record payment in backend
          await recordOrderPayment(orderId, backendPaymentRequest);
          
          // Update order status to 'paid'
          await updateOrderStatusToPaid(orderId, paymentIntentId);
          
          console.log('[OrderDetail] Payment successfully synced with backend');

          Alert.alert(
            'Payment Successful',
            `Your payment of €${orderDetails.total.toFixed(2)} has been processed successfully!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Payment is now fully recorded - user can navigate away
                  console.log('[OrderDetail] Payment completed and synced');
                }
              }
            ]
          );

        } catch (backendError: any) {
          // Payment succeeded on Stripe but failed to sync with backend
          console.error('[OrderDetail] Backend sync failed:', backendError);
          
          Alert.alert(
            'Payment Completed',
            'Your payment was successful, but we had trouble updating your order. Please contact support if you don\'t see the update shortly.',
            [{ text: 'OK' }]
          );
        }
        
      } else if (!result.canceled) {
        // Error occurred (but user didn't cancel)
        console.error('[OrderDetail] Payment failed:', result.error);
        
        // Store failed payment attempt
        addPayment({
          paymentId: 'failed',
          orderId: orderId,
          amount: Math.round(orderDetails.total * 100),
          currency: 'eur',
          status: 'failed',
          paidBy: state.userInfo?.sub || state.userInfo?.username || 'unknown',
          paidTo: orderDetails.producerName,
          paymentDate: new Date().toISOString(),
          paymentDueDate: orderDetails.paymentDue,
          errorMessage: result.error,
        });
        
        Alert.alert('Payment Failed', result.error || 'An error occurred');
      }
    } catch (error: any) {
      console.error('[OrderDetail] Unexpected error during payment:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };  const formatDate = (dateString: string) => {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color="#4A4459" />
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
            <Image source={require("../../assets/images/icons8-map-pin-96.png")} style={styles.addressIcon} />
            <Text style={styles.addressText}>{orderDetails.producerAddress}</Text>
          </View>
        </View>

        {/* Payment Information - Only visible to Restaurant owners */}
        {isRestaurant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('order_detail.payment_information')}</Text>
            
            {isPaid ? (
              // Show payment completed status
              <View style={styles.paymentCompletedContainer}>
                <View style={styles.paymentCompletedHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#89A083" />
                  <Text style={styles.paymentCompletedTitle}>Payment Completed</Text>
                </View>
                <View style={styles.paymentDetailsContainer}>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Amount Paid:</Text>
                    <Text style={styles.paymentDetailValue}>€{orderDetails.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Payment Date:</Text>
                    <Text style={styles.paymentDetailValue}>
                      {new Date(existingPayment.paymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Payment ID:</Text>
                    <Text style={[styles.paymentDetailValue, styles.paymentId]}>
                      {existingPayment.paymentId.substring(0, 20)}...
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // Show payment due with button
              <View style={styles.paymentRow}>
                <View style={styles.paymentInfo}>
                  <Image source={require("../../assets/images/icons8-error-96.png")} style={styles.paymentIcon} />
                  <Text style={styles.paymentDueText}>
                    {t('order_detail.payment_due', { date: formatPaymentDate(orderDetails.paymentDue) })}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.payButton, loading && styles.payButtonDisabled]} 
                  onPress={didTapCheckoutButton}
                  disabled={loading}
                >
                  <Text style={styles.payButtonText}>
                    {loading ? 'Processing...' : t('order_detail.pay_now')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order_detail.order_information')}</Text>
          <View style={styles.timelineContainer}>
            {/* Order Placed */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={[styles.timelineIcon, styles.completedIcon]}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                {orderDetails.status !== 'pending' && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{t('order_detail.order_placed')}</Text>
                <Text style={styles.timelineDate}>{formatDate(orderDetails.orderDate)}</Text>
              </View>
            </View>

            {/* Order Accepted */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={[styles.timelineIcon,
                orderDetails.status !== 'pending' ? styles.completedIcon : styles.pendingIcon]}>
                  {orderDetails.status !== 'pending' ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                {(orderDetails.status === 'delivered' || orderDetails.status === 'paid') &&
                  <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle,
                orderDetails.status === 'pending' && styles.pendingTitle]}>
                  {t('order_detail.order_accepted')}
                </Text>
                <Text style={styles.timelineDate}>
                  {orderDetails.status !== 'pending' ? formatDate(orderDetails.acceptedDate) : t('order_detail.pending')}
                </Text>
              </View>
            </View>

            {/* Delivery */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={[styles.timelineIcon,
                (orderDetails.status === 'delivered' || orderDetails.status === 'paid') ? styles.completedIcon : styles.upcomingIcon]}>
                  {(orderDetails.status === 'delivered' || orderDetails.status === 'paid') ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="cube-outline" size={12} color="#9CA3AF" />
                  )}
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle,
                (orderDetails.status !== 'delivered' && orderDetails.status !== 'paid') && styles.upcomingTitle]}>
                  {orderDetails.deliveryMode === 'pickup'
                    ? t('orders.pickup_at_farm')
                    : t('orders.at_restaurant')
                  }
                </Text>
                <Text style={styles.timelineDate}>
                  {(orderDetails.status === 'delivered' || orderDetails.status === 'paid')
                    ? formatDate(orderDetails.deliveryDate)
                    : formatDate(orderDetails.deliveryDate)
                  }
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>{t('order_detail.current_status')}:</Text>
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
              <Image source={require("../../assets/images/icons8-call-96.png")} style={styles.actionIcon} />
              <Text style={styles.actionText}>{t('order_detail.call_producer')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmailProducer}>
              <Image source={require("../../assets/images/icons8-email-96.png")} style={styles.actionIcon} />
              <Text style={styles.actionText}>{t('order_detail.email_producer')}</Text>
            </TouchableOpacity>
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
    fontSize: 18,
    lineHeight: 27,
    color: '#4A4459',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 5,
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
    width: 16,
    height: 16,
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
    width: 20,
    height: 20,
  },
  paymentDueText: {
    fontSize: 14,
    color: "#b55d62ff",
    fontWeight: "700",
    flex: 1,
  },
  payButton: {
    backgroundColor: "#b55d62ff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  payButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  payButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },

  // Payment Completed Styles
  paymentCompletedContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#89A083",
  },
  paymentCompletedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  paymentCompletedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#89A083",
  },
  paymentDetailsContainer: {
    gap: 12,
  },
  paymentDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDetailLabel: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
  },
  paymentDetailValue: {
    fontSize: 14,
    color: "#4A4459",
    fontWeight: "600",
  },
  paymentId: {
    fontSize: 12,
    fontFamily: 'monospace',
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

  // Timeline Stepper
  timelineContainer: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  timelineIconContainer: {
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    zIndex: 1,
  },
  completedIcon: {
    backgroundColor: "#89A083",
  },
  pendingIcon: {
    backgroundColor: "#df9f32ff",
  },
  upcomingIcon: {
    backgroundColor: "#E5E7EB",
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  timelineLine: {
    position: "absolute",
    top: 40,
    left: 15,
    width: 2,
    height: 32,
    backgroundColor: "#D1D5DB",
    zIndex: 0,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4459",
    marginBottom: 4,
  },
  pendingTitle: {
    color: "#F59E0B",
  },
  upcomingTitle: {
    color: "#9CA3AF",
  },
  timelineDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statusLabel: {
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
    paddingTop: 15,
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
    backgroundColor: "#eae9e15e",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    width: 25,
    height: 25,
  },
  actionText: {
    fontSize: 16,
    color: "#4A4459",
    fontWeight: "500",
  },
});
