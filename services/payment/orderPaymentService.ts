/**
 * Order Payment Service
 * 
 * Extended payment service to handle order-related payment tracking and management
 */

import type { PaymentRecord } from '../../components/PaymentContext';
import { httpGet, httpPatch, httpPost } from '../shared/httpClient';

// ============================================
// Request/Response Types (matching backend DTOs)
// ============================================

export interface PaymentRecordRequest {
  paymentIntentId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paidBy: string; // Keycloak user ID
  paidTo: string; // Producer name
  paymentDate: string; // ISO string
  paymentDueDate: string; // ISO string  
  errorMessage?: string;
  
  // New fields for Stripe Connect support
  stripeAccountId?: string; // Connected Stripe account ID
  applicationFeeAmount?: number; // Platform fee amount in cents
}

export interface PaymentRecordResponse {
  id: string;
  orderId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paidBy: string;
  paidTo: string;
  paymentDate: string;
  paymentDueDate: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  
  // New fields for Stripe Connect support
  stripeAccountId?: string; // Connected Stripe account ID
  applicationFeeAmount?: number; // Platform fee amount in cents
}

export interface OrderStatusUpdateRequest {
  status: 'paid';
  paymentIntentId: string;
}

export interface OrderStatusUpdateResponse {
  orderId: string;
  status: string;
  previousStatus: string;
  updatedAt: string;
  updatedBy: string;
}

// ============================================
// Configuration
// ============================================

// Use same base URL as payment service
const PAYMENT_BASE_URL = process.env.EXPO_PUBLIC_PAYMENT_URL || 'http://localhost:5004';

const ORDER_PAYMENT_ENDPOINTS = {
  RECORD_PAYMENT: (orderId: string) => `${PAYMENT_BASE_URL}/api/orders/${orderId}/payment`,
  GET_PAYMENT_STATUS: (orderId: string) => `${PAYMENT_BASE_URL}/api/orders/${orderId}/payment`,
  UPDATE_ORDER_STATUS: (orderId: string) => `${PAYMENT_BASE_URL}/api/orders/${orderId}/status`,
  VERIFY_PAYMENT: (paymentIntentId: string) => `${PAYMENT_BASE_URL}/api/payments/verify/${paymentIntentId}`,
} as const;

// ============================================
// Service Functions
// ============================================

/**
 * Create payment record data for connected account payment
 */
export function createConnectedAccountPaymentRecord(
  paymentIntentId: string,
  amount: number,
  currency: string,
  status: PaymentRecordRequest['status'],
  paidBy: string,
  paidTo: string,
  stripeAccountId?: string,
  applicationFeeAmount?: number
): PaymentRecordRequest {
  const now = new Date().toISOString();
  
  return {
    paymentIntentId,
    amount,
    currency,
    status,
    paidBy,
    paidTo,
    paymentDate: now,
    paymentDueDate: now, // For immediate payments
    stripeAccountId,
    applicationFeeAmount,
  };
}

/**
 * Record payment for an order (upsert - creates or updates existing)
 * Called after successful Stripe payment
 */
export async function recordOrderPayment(
  orderId: string,
  paymentData: PaymentRecordRequest
): Promise<PaymentRecordResponse> {
  try {
    console.log('[OrderPaymentService] Recording payment for order:', orderId);
    
    const response = await httpPost<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.RECORD_PAYMENT(orderId),
      paymentData,
      { timeout: 10000 }
    );

    console.log('[OrderPaymentService] Payment recorded successfully');
    return response;
    
  } catch (error: any) {
    console.error('[OrderPaymentService] Failed to record payment:', error);
    throw error;
  }
}

/**
 * Get payment status for an order
 * Returns payment record if exists, throws if not found
 */
export async function getOrderPaymentStatus(
  orderId: string
): Promise<PaymentRecordResponse | null> {
  try {
    console.log('[OrderPaymentService] Getting payment status for order:', orderId);
    
    const response = await httpGet<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.GET_PAYMENT_STATUS(orderId),
      { timeout: 5000 }
    );

    return response;
    
  } catch (error: any) {
    // Return null if payment not found (404)
    if (error.statusCode === 404) {
      console.log('[OrderPaymentService] No payment found for order:', orderId);
      return null;
    }
    
    console.error('[OrderPaymentService] Failed to get payment status:', error);
    throw error;
  }
}

/**
 * Update order status to 'paid' after successful payment
 */
export async function updateOrderStatusToPaid(
  orderId: string,
  paymentIntentId: string
): Promise<OrderStatusUpdateResponse> {
  try {
    console.log('[OrderPaymentService] Updating order status to paid:', orderId);
    
    const response = await httpPatch<OrderStatusUpdateResponse>(
      ORDER_PAYMENT_ENDPOINTS.UPDATE_ORDER_STATUS(orderId),
      {
        status: 'paid',
        paymentIntentId
      } as OrderStatusUpdateRequest,
      { timeout: 5000 }
    );

    console.log('[OrderPaymentService] Order status updated successfully');
    return response;
    
  } catch (error: any) {
    console.error('[OrderPaymentService] Failed to update order status:', error);
    throw error;
  }
}

/**
 * Verify payment with Stripe backend (optional but recommended)
 * Server-side verification of payment intent status
 */
export async function verifyPaymentWithStripe(
  paymentIntentId: string
): Promise<PaymentRecordResponse> {
  try {
    console.log('[OrderPaymentService] Verifying payment with Stripe:', paymentIntentId);
    
    const response = await httpPost<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.VERIFY_PAYMENT(paymentIntentId),
      {}, // Empty body for verification endpoint
      { timeout: 10000 }
    );

    console.log('[OrderPaymentService] Payment verified successfully');
    return response;
    
  } catch (error: any) {
    console.error('[OrderPaymentService] Failed to verify payment:', error);
    throw error;
  }
}

/**
 * Helper function to convert PaymentRecord (frontend) to PaymentRecordRequest (backend)
 */
export function convertPaymentRecordToRequest(
  paymentRecord: PaymentRecord
): PaymentRecordRequest {
  return {
    paymentIntentId: paymentRecord.paymentId,
    amount: paymentRecord.amount,
    currency: paymentRecord.currency,
    status: paymentRecord.status,
    paidBy: paymentRecord.paidBy,
    paidTo: paymentRecord.paidTo,
    paymentDate: paymentRecord.paymentDate,
    paymentDueDate: paymentRecord.paymentDueDate,
    errorMessage: paymentRecord.errorMessage,
  };
}

/**
 * Helper function to convert PaymentRecordResponse (backend) to PaymentRecord (frontend)  
 */
export function convertPaymentResponseToRecord(
  response: PaymentRecordResponse
): PaymentRecord {
  return {
    paymentId: response.paymentIntentId,
    orderId: response.orderId,
    amount: response.amount,
    currency: response.currency,
    status: response.status,
    paidBy: response.paidBy,
    paidTo: response.paidTo,
    paymentDate: response.paymentDate,
    paymentDueDate: response.paymentDueDate,
    errorMessage: response.errorMessage,
  };
}