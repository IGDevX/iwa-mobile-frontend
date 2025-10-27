import { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../components/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
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
    priority: 'high'
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
  // Add more restaurant notifications with mixed read/unread status
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
  // Add more producer notifications with mixed read/unread status
];

export const useNotifications = () => {
  const { hasRole, state } = useContext(AuthContext);
  const isProducer = hasRole('producer');
  
  const notifications = useMemo(() => {
    // Return empty array if user is not signed in
    if (!state.isSignedIn) {
      return [];
    }
    return isProducer ? mockProducerNotifications : mockRestaurantNotifications;
  }, [isProducer, state.isSignedIn]);

  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  const hasUnreadNotifications = unreadCount > 0;

  return {
    notifications,
    unreadCount,
    hasUnreadNotifications,
    isProducer
  };
};