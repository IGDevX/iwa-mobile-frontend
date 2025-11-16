import React, { useState, useContext, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image 
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '../components/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low' | 'new';
  actionRequired?: boolean;
  orderId?: string;
}

const mockRestaurantNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_order_registered',
    title: 'notifications.restaurant.new_order_registered',
    message: 'notifications.restaurant.new_order_text',
    date: '10 oct.',
    isRead: false,
    priority: 'new'
  },
  {
    id: '2', 
    type: 'order_accepted',
    title: 'notifications.restaurant.order_accepted',
    message: 'notifications.restaurant.order_accepted_text',
    date: '10 oct.',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'order_refused',
    title: 'notifications.restaurant.order_refused', 
    message: 'notifications.restaurant.order_refused_text',
    date: '10 oct.',
    isRead: true,
    priority: 'high'
  },
  {
    id: '4',
    type: 'payment_due',
    title: 'notifications.restaurant.payment_due',
    message: 'notifications.restaurant.payment_due_text', 
    date: '9 oct.',
    isRead: false,
    priority: 'medium',
    actionRequired: true,
    orderId: 'ORD-001'
  },
  {
    id: '5',
    type: 'pickup_reminder',
    title: 'notifications.restaurant.pickup_reminder',
    message: 'notifications.restaurant.pickup_reminder_text',
    date: '9 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '6',
    type: 'delivery_reminder',
    title: 'notifications.restaurant.delivery_reminder',
    message: 'notifications.restaurant.delivery_reminder_text',
    date: '9 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '7',
    type: 'profile_incomplete',
    title: 'notifications.restaurant.profile_incomplete',
    message: 'notifications.restaurant.profile_incomplete_text',
    date: '9 oct.',
    isRead: true,
    priority: 'low'
  },
  {
    id: '8',
    type: 'certification_expired',
    title: 'notifications.restaurant.certification_expired',
    message: 'notifications.restaurant.certification_expired_text',
    date: '8 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '9',
    type: 'new_feature',
    title: 'notifications.restaurant.new_feature',
    message: 'notifications.restaurant.new_feature_text',
    date: '8 oct.',
    isRead: true,
    priority: 'low'
  },
  {
    id: '10',
    type: 'message_received',
    title: 'notifications.restaurant.message_received',
    message: 'notifications.restaurant.message_received_text',
    date: '8 oct.',
    isRead: true,
    priority: 'medium'
  }
];

const mockProducerNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_order_request',
    title: 'notifications.producer.new_order_request',
    message: 'notifications.producer.new_order_text',
    date: '10 oct.',
    isRead: false,
    priority: 'high',
    actionRequired: true,
    orderId: 'REQ-001'
  },
  {
    id: '2',
    type: 'payment_due_soon',
    title: 'notifications.producer.payment_due_soon',
    message: 'notifications.producer.payment_due_text',
    date: '10 oct.',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'unpaid_order_expired',
    title: 'notifications.producer.unpaid_order_expired',
    message: 'notifications.producer.unpaid_order_text',
    date: '10 oct.',
    isRead: true,
    priority: 'high'
  },
  {
    id: '4',
    type: 'stock_shortage',
    title: 'notifications.producer.stock_shortage',
    message: 'notifications.producer.stock_shortage_text',
    date: '9 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'item_expiring',
    title: 'notifications.producer.item_expiring',
    message: 'notifications.producer.item_expiring_text',
    date: '9 oct.',
    isRead: false,
    priority: 'medium',
    actionRequired: true
  },
  {
    id: '6',
    type: 'profile_incomplete',
    title: 'notifications.producer.profile_incomplete',
    message: 'notifications.producer.profile_incomplete_text',
    date: '9 oct.',
    isRead: true,
    priority: 'low'
  },
  {
    id: '7',
    type: 'delivery_reminder',
    title: 'notifications.producer.delivery_reminder',
    message: 'notifications.producer.delivery_reminder_text',
    date: '9 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '8',
    type: 'pickup_reminder',
    title: 'notifications.producer.pickup_reminder',
    message: 'notifications.producer.pickup_reminder_text',
    date: '8 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '9',
    type: 'certification_expired',
    title: 'notifications.producer.certification_expired',
    message: 'notifications.producer.certification_expired_text',
    date: '8 oct.',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '10',
    type: 'new_feature',
    title: 'notifications.producer.new_feature',
    message: 'notifications.producer.new_feature_text',
    date: '8 oct.',
    isRead: true,
    priority: 'low'
  }
];

export default function NotificationScreen() {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);

  const userRole = state.userInfo?.roles?.[0];
  const isProducer = userRole === 'Producer';
  const isRestaurantOwner = userRole === 'Restaurant Owner';
  
  // Check if user is logged in - redirect if not
  useEffect(() => {
    if (!state.isSignedIn) {
      Alert.alert(
        t('auth.login.title', 'Login Required'),
        t('notifications.login_required_message', 'You need to login to access notifications. Would you like to login now?'),
        [
          { 
            text: t('common.cancel', 'Cancel'), 
            style: 'cancel',
            onPress: () => router.back()
          },
          {
            text: t('auth.login.sign_in', 'Login'),
            onPress: () => router.push('/profile/login')
          }
        ]
      );
      return;
    }
  }, [state.isSignedIn]);

  const [notifications, setNotifications] = useState<Notification[]>(
    isProducer ? mockProducerNotifications : mockRestaurantNotifications
  );
  

  const handleBack = () => {
    router.back();
  };

  // Don't render the page if user is not logged in
  if (!state.isSignedIn) {
    return null;
  }

  const handleClearInbox = () => {
    Alert.alert(
      t('notifications.clear_inbox'),
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  const handleNotificationAction = (notification: Notification, action: string) => {
    if (action === 'pay' && notification.orderId) {
      Alert.alert(
        'Payment',
        `Proceed to pay for order ${notification.orderId}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pay', 
            onPress: () => {
              // Mock payment process
              Alert.alert('Success', 'Payment processed successfully!');
              // Remove or update notification
              setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              );
            }
          }
        ]
      );
    } else if (action === 'accept' && notification.orderId) {
      Alert.alert(
        'Accept Order',
        `Accept order request ${notification.orderId}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Accept', 
            onPress: () => {
              Alert.alert('Success', 'Order request accepted!');
              setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              );
            }
          }
        ]
      );
    } else if (action === 'refuse' && notification.orderId) {
      Alert.alert(
        'Refuse Order',
        `Refuse order request ${notification.orderId}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Refuse', 
            style: 'destructive',
            onPress: () => {
              Alert.alert('Order Refused', 'Order request has been refused.');
              setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              );
            }
          }
        ]
      );
    } else if (action === 'extend') {
      Alert.alert(
        'Extend Product',
        'Product expiration extended by 5 days.',
        [{ text: 'OK' }]
      );
      setNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      t('notifications.delete_notification', 'Delete Notification'),
      t('notifications.delete_confirmation', 'Are you sure you want to delete this notification?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => 
              prev.filter(n => n.id !== notificationId)
            );
          },
        },
      ]
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#b55d62ff';
      case 'medium': return '#b5ab5dff'; 
      case 'low': return '#5d64b5ff';
      case 'new': return '#5db55fff';
    }
  };

  const getNotificationIcon = (priority: string) => {
    // Mock icon mapping - in a real app, you'd have actual icon files
    switch (priority) {
      case 'high': return <Ionicons name="warning" size={20} color="#b55d62ff" />;
      case 'medium': return <Ionicons name="warning" size={20} color="#b5ab5dff" />;
      case 'low': return <Ionicons name="alert-circle" size={20} color="#5d64b5ff" />;
      case 'new': return <Ionicons name="checkmark-circle" size={20} color="#5db55fff" />;
    }
  };

  const renderNotificationAction = (notification: Notification) => {
    if (!notification.actionRequired) return null;

    if (notification.type === 'payment_due') {
      return (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleNotificationAction(notification, 'pay')}
        >
          <Text style={styles.actionButtonText}>{t('notifications.pay')}</Text>
        </TouchableOpacity>
      );
    }

    if (notification.type === 'new_order_request') {
      return (
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleNotificationAction(notification, 'accept')}
          >
            <Text style={styles.actionButtonText}>{t('notifications.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.refuseButton]}
            onPress={() => handleNotificationAction(notification, 'refuse')}
          >
            <Text style={[styles.actionButtonText, styles.refuseButtonText]}>{t('notifications.refuse')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (notification.type === 'item_expiring') {
      return (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleNotificationAction(notification, 'extend')}
        >
          <Text style={styles.actionButtonText}>{t('notifications.extend')}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4A4459" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          <TouchableOpacity onPress={handleClearInbox}>
            <Image source={require("../assets/images/icons8-trash-96.png")} style={styles.trashIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Indicator */}
      <View style={styles.roleIndicator}>
        <Ionicons 
          name={isProducer ? "leaf" : "restaurant"} 
          size={16} 
          color="#89A083" 
        />
        <Text style={styles.roleText}>
          {isProducer ? t('notifications.producer_space') : t('notifications.restaurant_space')}
        </Text>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#89A083" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { borderLeftColor: getPriorityColor(notification.priority) },
                !notification.isRead && styles.unreadNotification
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              {/* Close button at top right */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering markAsRead
                  handleDeleteNotification(notification.id);
                }}
              >
                <Ionicons name="close" size={20} color="#89A083" />
              </TouchableOpacity>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationTitleContainer}>
                    {getNotificationIcon(notification.priority)}
                    <Text style={styles.notificationTitle}>
                      {t(notification.title)}
                    </Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Ionicons name="time" size={12} color="#4A4459" style={styles.dateIcon} />
                    <Text style={styles.dateText}>{notification.date}</Text>
                  </View>
                </View>
                
                <Text style={styles.notificationMessage}>
                  {t(notification.message)}
                </Text>

                {renderNotificationAction(notification)}
              </View>
            </TouchableOpacity>
          ))
        )}
        
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>{t('notifications.load_more')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6ED',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4459',
    lineHeight: 30,
  },
  clearButton: {
    fontSize: 14,
    color: '#89A083',
    textDecorationLine: 'underline',
    lineHeight: 21,
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#89A083',
    lineHeight: 21,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#89A083',
    marginTop: 16,
  },
  notificationCard: {
    backgroundColor: '#EAE9E1',
    borderRadius: 15,
    borderLeftWidth: 4,
    marginBottom: 16,
    padding: 16,
    paddingLeft: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#F0F0F0',
  },
  notificationContent: {
    flex: 1,
    gap: 8,
    paddingRight: 30, // Add padding to avoid overlap with close button
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  notificationIcon: {
    width: 20,
    height: 20,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4459',
    lineHeight: 21,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateIcon: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: '#4A4459',
    opacity: 0.7,
    lineHeight: 18,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#4A4459',
    lineHeight: 21.13,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#89A083',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  acceptButton: {
    backgroundColor: '#89A083',
  },
  refuseButton: {
    backgroundColor: '#F7F6ED',
    borderWidth: 1,
    borderColor: '#4A4459',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFEF4',
    fontWeight: '500',
    lineHeight: 18,
  },
  refuseButtonText: {
    color: '#4A4459',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 89, 89, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trashIcon: {
    width: 30,
    height: 30,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#89A083',
    textDecorationLine: 'underline',
    lineHeight: 21,
  },
});
