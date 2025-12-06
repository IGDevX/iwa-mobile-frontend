/**
 * Order Payment Service
 * 
 * Extended payment service to handle order-related payment tracking and management
 */

import type { PaymentRecord } from '../../components/PaymentContext';
import { paymentGet, paymentPatch, paymentPost } from './paymentHttpClient';

// ============================================
// Request/Response Types (matching backend DTOs)
// ============================================

export interface PaymentRecordRequest {
  paymentIntentId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
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
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
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

// Use the API gateway base so frontend talks to gateway which routes to payment service
import { API_GATEWAY_BASE_URL } from '../../constants/Config';


const ORDER_PAYMENT_ENDPOINTS = {
  // Routes are prefixed with /payment so gateway will forward to payment-service
  RECORD_PAYMENT: (orderId: string) => `/orders/${orderId}/payment`,
  GET_PAYMENT_STATUS: (orderId: string) => `/orders/${orderId}/payment`,
  UPDATE_ORDER_STATUS: (orderId: string) => `/orders/${orderId}/status`,
  VERIFY_PAYMENT: (paymentIntentId: string) => `/payments/verify/${paymentIntentId}`,
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
    
    const response = await paymentPost<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.RECORD_PAYMENT(orderId),
      paymentData
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
    
    const response = await paymentGet<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.GET_PAYMENT_STATUS(orderId)
    );

    return response;
    
  } catch (error: any) {
    // Return null if payment not found (404) or JSON parse error
    if (error.message?.includes('404') || error.message?.includes('JSON Parse error') || error.name === 'SyntaxError') {
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
    
    const response = await paymentPatch<OrderStatusUpdateResponse>(
      ORDER_PAYMENT_ENDPOINTS.UPDATE_ORDER_STATUS(orderId),
      {
        status: 'paid',
        paymentIntentId
      } as OrderStatusUpdateRequest
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
    
    const response = await paymentPost<PaymentRecordResponse>(
      ORDER_PAYMENT_ENDPOINTS.VERIFY_PAYMENT(paymentIntentId),
      {}, // Empty body for verification endpoint
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
    stripeAccountId: paymentRecord.stripeAccountId,
    applicationFeeAmount: paymentRecord.applicationFeeAmount
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