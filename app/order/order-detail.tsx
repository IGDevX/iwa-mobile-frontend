import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../components/AuthContext";
import { usePaymentContext } from "../../components/PaymentContext";
import { usePayment } from "../../hooks/usePayment";
import { convertPaymentRecordToRequest, convertPaymentResponseToRecord, getOrderPaymentStatus, recordOrderPayment, updateOrderStatusToPaid } from "../../services/payment";
import { OrderDetailDto } from '../../services/order/orderApi';
import { OrderItemDetailDto } from '../../services/order/orderApi';
import orderService from "../../services/order/orderService";
import { getUserByKeycloakId } from '../../services/account/accountService';
import { getCompleteUserProfile } from '../../services/account';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface UIOrderDetails {
  id: string;
  orderNumber: string;
  producerName: string;
  producerAddress?: string;
  producerKeycloakId?: string; // Producer's Keycloak ID for payments
  restaurantName?: string;
  restaurantAddress?: string;
  consumerKeycloakId?: string; // Restaurant's Keycloak ID
  stripeAccountId?: string;
  total: number;
  status: OrderDetailDto['status'];
  deliveryMode: OrderDetailDto['deliveryMode'];
  orderDate: string;
  acceptedDate: string;
  deliveryDate: string;
  paymentDue: string;
  items: OrderItem[];
  deliveryFee: number;
  subtotal: number;
}

// Order details will be loaded from backend

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);
  const { addPayment, getPaymentByOrderId, updatePaymentStatus } = usePaymentContext();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // Determine user role
  const userRole = state.userInfo?.roles?.[0] || 'Producer';
  const isRestaurant = userRole === 'Restaurant Owner';

  // Load order detail from backend
  const [orderDetails, setOrderDetails] = React.useState<UIOrderDetails | null>(null);
  const [loadingOrder, setLoadingOrder] = React.useState<boolean>(true);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  // Helper to get Keycloak admin token
  const getKeycloakAdminToken = async (): Promise<string | null> => {
    try {
      const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
      const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
      const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG;

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

  // Helper to get producer info from Keycloak
  const fetchProducerInfo = async (producerKeycloakId: string): Promise<{
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    email: string;
    profession?: string;
  } | null> => {
    try {
      const completeProfile = await getCompleteUserProfile(producerKeycloakId, getKeycloakAdminToken);
      return completeProfile.keycloak;
    } catch (error) {
      console.error('Failed to fetch producer info:', error);
      return null;
    }
  };

  // Helper to get restaurant info from Keycloak
  const fetchRestaurantInfo = async (restaurantKeycloakId: string): Promise<{
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    email: string;
  } | null> => {
    try {
      const completeProfile = await getCompleteUserProfile(restaurantKeycloakId, getKeycloakAdminToken);
      return completeProfile.keycloak;
    } catch (error) {
      console.error('Failed to fetch restaurant info:', error);
      return null;
    }
  };


  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!orderId) return;
      setLoadingOrder(true);
      setOrderError(null);

      try {
        const data: OrderDetailDto = await orderService.getOrderById(Number(orderId));

        if (!mounted) return;

        // Fetch producer display name (assuming you have producerKeycloakId in data)
        let producerInfo: any;
        let producerName = `Producer #${data.producerKeycloakId}`;
        let producerAddress = '';
        if (data.producerKeycloakId) {
          producerInfo = await fetchProducerInfo(data.producerKeycloakId.toString());
          if (producerInfo) {
            producerName = producerInfo.displayName
            producerAddress = producerInfo.address || '';
          }
        }

        // Fetch restaurant display name for producers
        let restaurantInfo: any;
        let restaurantName = `Restaurant #${data.consumerKeycloakId}`;
        let restaurantAddress = '';
        if (data.consumerKeycloakId && !isRestaurant) {
          restaurantInfo = await fetchRestaurantInfo(data.consumerKeycloakId.toString());
          if (restaurantInfo) {
            restaurantName = restaurantInfo.displayName;
            restaurantAddress = restaurantInfo.address || '';
          }
        }

        // Map API response to UI-friendly structure
        const mapped: UIOrderDetails = {
          id: data.id.toString(),
          orderNumber: data.reference,
          producerName,
          producerAddress,
          restaurantName,
          restaurantAddress,
          consumerKeycloakId: data.consumerKeycloakId?.toString(),
          total: data.totalAmount,
          status: data.status,
          deliveryMode: data.deliveryMode,
          orderDate: data.createdAt,
          acceptedDate: data.createdAt,
          deliveryDate: data.createdAt,
          paymentDue: data.createdAt,
          items: data.items.map((i: OrderItemDetailDto) => ({
            id: i.productId.toString(),
            name: `${i.productId}`,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.subtotal,
          })),
          deliveryFee: 0, // API currently does not provide; can be added later
          subtotal: data.items.reduce((sum, i) => sum + i.subtotal, 0),
        };



        // Fetch producer info for Stripe account
        if (mapped.producerKeycloakId) {
          try {
            const producerProfile = await getUserByKeycloakId(mapped.producerKeycloakId);
            mapped.stripeAccountId = producerProfile.stripeAccountId;
          } catch (err) {
            console.error('[OrderDetail] Failed to fetch producer info:', err);
          }
        }

        setOrderDetails(mapped);

      } catch (err: any) {
        console.error('[OrderDetail] Failed to fetch order:', err);
        setOrderError(err?.message || 'Failed to load order');
      } finally {
        if (mounted) setLoadingOrder(false);
      }
    };

    loadOrder();
    return () => { mounted = false; };
  }, [orderId]);

  // Check if payment exists for this order
  const existingPayment = getPaymentByOrderId(orderId);
  console.log(existingPayment?.status)
  const isPaid = existingPayment?.status === 'SUCCEEDED';

  // Initialize payment hook with producer info for Stripe Connect
  const { loading, openPaymentSheet } = usePayment({
    amount: Math.round((orderDetails?.total || 0) * 100), // Convert to cents
    currency: 'eur',
    merchantDisplayName: orderDetails?.producerName || 'Merchant',
    producerKeycloakId: orderDetails?.producerKeycloakId, // For direct payment to producer
    stripeAccountId: orderDetails?.stripeAccountId || 'unknown',
    orderId: orderDetails?.id || orderId, // For tracking
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

  const getStatusStyle = (status: UIOrderDetails['status']) => {
    switch (status) {
      case 'accepted':
        return { backgroundColor: '#DCFCE7', color: '#016630' };
      case 'pending':
        return { backgroundColor: '#FFEDD4', color: '#9F2D00' };
      case 'delivered':
        return { backgroundColor: '#DBEAFE', color: '#193CB8' };
      case 'not_delivered':
        return { backgroundColor: '#FFE2E2', color: '#9F0712' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#4A4459' };
    }
  };

  const handleCallProducer = () => {
    const phoneNumber = (orderDetails as any)?.producerPhone || '+33123456789';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailProducer = () => {
    const email = (orderDetails as any)?.producerEmail || 'contact@fermebiousoleil.fr';
    Linking.openURL(`mailto:${email}`);
  };

  const handleStatusChange = async (newStatus: OrderDetailDto['status']) => {
    if (!orderDetails) return;

    try {
      const updatedOrder = await orderService.updateOrderStatus(Number(orderDetails.id), newStatus);
      
      // Update local state with new status
      setOrderDetails({
        ...orderDetails,
        status: updatedOrder.status,
      });

      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      Alert.alert('Error', error?.message || 'Failed to update order status');
    }
  };

  const didTapCheckoutButton = async () => {
    // Guard: ensure order details are loaded before attempting payment
    if (!orderDetails) {
      Alert.alert('Order not loaded', 'Unable to start payment because order details are missing.');
      return;
    }

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
          status: 'SUCCEEDED' as const,
          paidBy: state.userInfo?.sub || state.userInfo?.username || 'unknown',
          paidTo: orderDetails.producerKeycloakId || orderDetails.producerName || 'unknown',
          paymentDate: new Date().toISOString(),
          paymentDueDate: new Date(orderDetails.paymentDue).toISOString().split("T")[0],
          stripeAccountId: orderDetails.stripeAccountId,
          applicationFeeAmount: Math.round(orderDetails.total * 100 * 0.10),
          errorMessage: undefined,
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
          status: 'FAILED',
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
  }; const formatDate = (dateString: string) => {
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

  // Show loading / error states for order fetch
  if (loadingOrder) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>{t('orders.loading', 'Loading order...')}</Text>
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>{orderError || t('orders.not_found', 'Order not found')}</Text>
      </View>
    );
  }

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
        {/* Producer/Restaurant Info - Conditional based on user role */}
        <View style={styles.section}>
          <Text style={styles.producerName}>
            {isRestaurant ? orderDetails.producerName : orderDetails.restaurantName}
          </Text>
          <Text style={styles.orderNumber}>{orderDetails.orderNumber}</Text>
          <View style={styles.addressRow}>
            <Image source={require("../../assets/images/icons8-map-pin-96.png")} style={styles.addressIcon} />
            <Text style={styles.addressText}>
              {isRestaurant ? orderDetails.producerAddress : orderDetails.restaurantAddress}
            </Text>
          </View>
        </View>

        {/* Order Status Management - Only visible to Producers */}
        {!isRestaurant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Management</Text>
            
            {/* Step 1: Pending - Accept or Refuse */}
            {orderDetails.status === 'pending' && (
              <View style={styles.statusButtonsContainer}>
                <TouchableOpacity
                  style={[styles.statusButton, styles.statusButtonSuccess]}
                  onPress={() => handleStatusChange('accepted')}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={[styles.statusButtonText, styles.statusButtonTextActive]}>
                    Accept Order
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, styles.statusButtonDanger]}
                  onPress={() => handleStatusChange('refused')}
                >
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                  <Text style={[styles.statusButtonText, styles.statusButtonTextActive]}>
                    Refuse Order
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Accepted - Mark delivery status */}
            {orderDetails.status === 'accepted' && (
              <View style={styles.statusButtonsContainer}>
                <TouchableOpacity
                  style={[styles.statusButton, styles.statusButtonSuccess]}
                  onPress={() => handleStatusChange('delivered')}
                >
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                  <Text style={[styles.statusButtonText, styles.statusButtonTextActive]}>
                    Mark as Delivered
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, styles.statusButtonWarning]}
                  onPress={() => handleStatusChange('not_delivered')}
                >
                  <Ionicons name="alert-circle" size={20} color="#4A4459" />
                  <Text style={styles.statusButtonText}>
                    Not Delivered
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Final States - Show status only */}
            {(orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered' || orderDetails.status === 'refused') && (
              <View style={styles.finalStatusContainer}>
                <View style={[
                  styles.finalStatusBadge,
                  orderDetails.status === 'delivered' && styles.finalStatusSuccess,
                  orderDetails.status === 'refused' && styles.finalStatusDanger,
                  orderDetails.status === 'not_delivered' && styles.finalStatusWarning,
                ]}>
                  <Ionicons 
                    name={
                      orderDetails.status === 'delivered' ? 'checkmark-circle' :
                      orderDetails.status === 'refused' ? 'close-circle' : 'alert-circle'
                    }
                    size={24}
                    color={
                      orderDetails.status === 'delivered' ? '#16A34A' :
                      orderDetails.status === 'refused' ? '#DC2626' : '#F59E0B'
                    }
                  />
                  <Text style={styles.finalStatusText}>
                    Order {orderDetails.status === 'delivered' ? 'Delivered' : 
                            orderDetails.status === 'refused' ? 'Refused' : 'Not Delivered'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

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
            ) : orderDetails.status === 'delivered' ? (
              // Show payment button only when delivered
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
            ) : (
              // Show waiting message for non-delivered orders
              <View style={styles.paymentWaitingContainer}>
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
                <Text style={styles.paymentWaitingText}>
                  {orderDetails.status === 'pending' && 'Waiting for producer to accept order'}
                  {orderDetails.status === 'accepted' && 'Waiting for delivery to complete payment'}
                  {orderDetails.status === 'refused' && 'Order was refused - No payment required'}
                  {orderDetails.status === 'not_delivered' && 'Order not delivered - Contact producer'}
                </Text>
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
                (orderDetails.status === 'accepted' || orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') ? styles.completedIcon : 
                orderDetails.status === 'refused' ? styles.refusedIcon : styles.upcomingIcon]}>
                  {(orderDetails.status === 'accepted' || orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : orderDetails.status === 'refused' ? (
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                  )}
                </View>
                {(orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') &&
                  <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle,
                (orderDetails.status === 'pending' || orderDetails.status === 'refused') && styles.upcomingTitle]}>
                  {orderDetails.status === 'refused' ? t('order_detail.order_refused') : t('order_detail.order_accepted')}
                </Text>
                <Text style={styles.timelineDate}>
                  {(orderDetails.status === 'accepted' || orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') 
                    ? formatDate(orderDetails.acceptedDate) 
                    : orderDetails.status === 'refused' 
                      ? formatDate(orderDetails.acceptedDate)
                      : t('order_detail.awaiting_producer')}
                </Text>
              </View>
            </View>

            {/* Delivery */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={[styles.timelineIcon,
                (orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') ? styles.completedIcon : styles.upcomingIcon]}>
                  {(orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered') ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="cube-outline" size={12} color="#9CA3AF" />
                  )}
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle,
                (orderDetails.status !== 'delivered' && orderDetails.status !== 'not_delivered') && styles.upcomingTitle]}>
                  {orderDetails.deliveryMode === 'pickup'
                    ? t('orders.pickup_at_farm')
                    : t('orders.at_restaurant')
                  }
                </Text>
                <Text style={styles.timelineDate}>
                  {(orderDetails.status === 'delivered' || orderDetails.status === 'not_delivered')
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
                    {item.quantity} × {item.unitPrice.toFixed(2)} €
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

  // Payment Waiting Styles
  paymentWaitingContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFBEB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentWaitingText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
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
  refusedIcon: {
    backgroundColor: "#8e3636ff",
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
  loadingText: {
    fontSize: 16,
    color: '#4A4459',
  },

  // Status Management Buttons
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusButtonSuccess: {
    backgroundColor: '#89A083',
    borderColor: '#89A083',
  },
  statusButtonDanger: {
    backgroundColor: '#8e3636ff',
    borderColor: '#8e3636ff',
  },
  statusButtonWarning: {
    backgroundColor: '#df9f32ff',
    borderColor: '#df9f32ff',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4459',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  finalStatusContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  finalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  finalStatusSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#DCFCE7',
  },
  finalStatusDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FEE2E2',
  },
  finalStatusWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FEF3C7',
  },
  finalStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4459',
  },
});

