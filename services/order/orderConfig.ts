import { API_GATEWAY_BASE_URL } from '../../constants/Config';

const ORDER_PREFIX = '/order/orders';

export const ORDER_ENDPOINTS = {
  BASE: `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}`,
  BY_ID: (id: number) => `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}/${id}`,
  BY_PRODUCER: (producerId: number) => `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}/producer/${producerId}`,
  BY_CUSTOMER: (customerId: number) => `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}/customer/${customerId}`,
  UPDATE_STATUS: (orderId: number) => `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}/${orderId}/status`,
  PAYMENT_INTENT: (reference: string) => `${API_GATEWAY_BASE_URL}${ORDER_PREFIX}/${encodeURIComponent(reference)}/payment-intent`,
  PAYMENT_CONFIRMATION: (reference: string) => `${API_GATEWAY_BASE_URL}/order/internal/orders/${encodeURIComponent(reference)}/payment-confirmation`,
} as const;
