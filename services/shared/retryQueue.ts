/**
 * Retry Queue Service
 * 
 * Manages offline queue for failed account service notifications.
 * Stores pending notifications in AsyncStorage and retries them when network is available.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from '../../constants/Config';
import {
  type NotifyAccountServiceRequest,
  type NotifyAccountServiceResponse,
  type PendingNotification,
} from '../account/accountApi';
import { ACCOUNT_LEGACY_ENDPOINTS, ACCOUNT_STORAGE_KEYS } from '../account/accountConfig';
import { httpPost } from './httpClient';

/**
 * Get all pending notifications from storage
 */
export async function getPendingNotifications(): Promise<PendingNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(ACCOUNT_STORAGE_KEYS.PENDING_NOTIFICATIONS);
    if (!stored) return [];
    return JSON.parse(stored) as PendingNotification[];
  } catch (error) {
    console.error('Failed to get pending notifications:', error);
    return [];
  }
}

/**
 * Save pending notifications to storage
 */
async function savePendingNotifications(notifications: PendingNotification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNT_STORAGE_KEYS.PENDING_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save pending notifications:', error);
  }
}

/**
 * Add a notification to the pending queue
 */
export async function addPendingNotification(
  payload: NotifyAccountServiceRequest
): Promise<void> {
  try {
    const notifications = await getPendingNotifications();
    
    // Check if already queued
    const exists = notifications.find(n => n.keycloakId === payload.keycloakId);
    if (exists) {
      console.log('Notification already queued for:', payload.keycloakId);
      return;
    }

    // Add new pending notification
    const newNotification: PendingNotification = {
      id: `${payload.keycloakId}_${Date.now()}`,
      keycloakId: payload.keycloakId,
      payload,
      timestamp: Date.now(),
      attempts: 0,
    };

    notifications.push(newNotification);
    await savePendingNotifications(notifications);
    console.log('Added pending notification for:', payload.keycloakId);
  } catch (error) {
    console.error('Failed to add pending notification:', error);
  }
}

/**
 * Remove a notification from the pending queue
 */
export async function removePendingNotification(keycloakId: string): Promise<void> {
  try {
    const notifications = await getPendingNotifications();
    const filtered = notifications.filter(n => n.keycloakId !== keycloakId);
    await savePendingNotifications(filtered);
    console.log('Removed pending notification for:', keycloakId);
  } catch (error) {
    console.error('Failed to remove pending notification:', error);
  }
}

/**
 * Update a pending notification
 */
async function updatePendingNotification(updated: PendingNotification): Promise<void> {
  try {
    const notifications = await getPendingNotifications();
    const index = notifications.findIndex(n => n.id === updated.id);
    if (index !== -1) {
      notifications[index] = updated;
      await savePendingNotifications(notifications);
    }
  } catch (error) {
    console.error('Failed to update pending notification:', error);
  }
}

/**
 * Process a single pending notification
 */
async function processPendingNotification(
  notification: PendingNotification
): Promise<{ success: boolean; response?: NotifyAccountServiceResponse; error?: string }> {
  try {
    const response = await httpPost<NotifyAccountServiceResponse>(
      ACCOUNT_LEGACY_ENDPOINTS.KEYCLOAK_NOTIFICATION,
      notification.payload,
      { retries: 0 } // Don't retry here, we'll handle retries in the queue
    );

    return { success: true, response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Retry all pending notifications
 * Call this when app comes online or on app startup
 * 
 * @returns Object with success count and failed notifications
 */
export async function retryPendingNotifications(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{ keycloakId: string; success: boolean; error?: string }>;
}> {
  const notifications = await getPendingNotifications();
  
  if (notifications.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, results: [] };
  }

  console.log(`Retrying ${notifications.length} pending notifications...`);

  const results: Array<{ keycloakId: string; success: boolean; error?: string }> = [];
  const stillPending: PendingNotification[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const notification of notifications) {
    // Skip if too many attempts
    if (notification.attempts >= MAX_RETRY_ATTEMPTS) {
      console.warn(`Max retry attempts reached for ${notification.keycloakId}, removing from queue`);
      failed++;
      results.push({
        keycloakId: notification.keycloakId,
        success: false,
        error: 'Max retry attempts reached',
      });
      continue;
    }

    // Process the notification
    const result = await processPendingNotification(notification);

    if (result.success) {
      console.log(`Successfully processed pending notification for ${notification.keycloakId}`);
      succeeded++;
      results.push({
        keycloakId: notification.keycloakId,
        success: true,
      });
    } else {
      console.warn(`Failed to process pending notification for ${notification.keycloakId}:`, result.error);
      failed++;
      results.push({
        keycloakId: notification.keycloakId,
        success: false,
        error: result.error,
      });

      // Update and keep in queue if network error
      if (result.error && (result.error.includes('Network') || result.error.includes('timeout'))) {
        notification.attempts++;
        notification.lastError = result.error;
        stillPending.push(notification);
      }
    }

    // Add small delay between retries
    if (notifications.indexOf(notification) < notifications.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Save the still-pending notifications
  await savePendingNotifications(stillPending);

  console.log(`Retry complete: ${succeeded} succeeded, ${failed} failed, ${stillPending.length} still pending`);

  return {
    processed: notifications.length,
    succeeded,
    failed,
    results,
  };
}

/**
 * Clear all pending notifications
 * Use with caution - typically only for testing or manual cleanup
 */
export async function clearPendingNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEYS.PENDING_NOTIFICATIONS);
    console.log('Cleared all pending notifications');
  } catch (error) {
    console.error('Failed to clear pending notifications:', error);
  }
}

/**
 * Get count of pending notifications
 */
export async function getPendingNotificationCount(): Promise<number> {
  const notifications = await getPendingNotifications();
  return notifications.length;
}
