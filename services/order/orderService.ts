import { 
  CreateOrderRequest, CreateOrderResponse, OrderDetailDto, PaymentIntentResponse, 
  PaymentConfirmationRequest 
} from './orderApi';
import { ORDER_ENDPOINTS } from './orderConfig';
import { request } from './orderHttpClient';

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>(ORDER_ENDPOINTS.BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listOrders(params?: Record<string, string | number | undefined>): Promise<OrderDetailDto[]> {
  const qs = params
    ? '?' + Object.entries(params)
        .filter(([,v]) => v != null)
        .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  return request<OrderDetailDto[]>(ORDER_ENDPOINTS.BASE + qs, { method: 'GET' });
}

export async function getOrderById(id: number): Promise<OrderDetailDto> {
  return request<OrderDetailDto>(ORDER_ENDPOINTS.BY_ID(id), { method: 'GET' });
}

export async function getOrdersByCustomer(customerId: number): Promise<OrderDetailDto[]> {
  return request<OrderDetailDto[]>(ORDER_ENDPOINTS.BY_CUSTOMER(customerId), { method: 'GET' });
}

export async function getOrdersByProducer(producerId: number): Promise<OrderDetailDto[]> {
  return request<OrderDetailDto[]>(ORDER_ENDPOINTS.BY_PRODUCER(producerId), { method: 'GET' });
}

export async function createPaymentIntentForOrder(reference: string): Promise<PaymentIntentResponse> {
  return request<PaymentIntentResponse>(ORDER_ENDPOINTS.PAYMENT_INTENT(reference), { method: 'POST' });
}

export async function confirmPayment(reference: string, payload: PaymentConfirmationRequest, serviceToken: string): Promise<void> {
  await request<void>(ORDER_ENDPOINTS.PAYMENT_CONFIRMATION(reference), {
    method: 'POST',
    body: JSON.stringify(payload),
  }, serviceToken);
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderDetailDto> {
  return request<OrderDetailDto>(ORDER_ENDPOINTS.UPDATE_STATUS(orderId), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export default {
  createOrder,
  listOrders,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByProducer,
  createPaymentIntentForOrder,
  confirmPayment,
  updateOrderStatus,
};
