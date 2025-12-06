/**
 * Order Service Types (API v1)
 */

// Order creation request
export interface CreateOrderRequest {
  producerInternalId: number;
  producer_keycloak_id: string;
  customerId: number;
  consumer_keycloak_id: string;
  deliveryMode?: 'pickup' | 'delivery';
  items: OrderItemRequest[];
  idempotencyKey?: string;
}

// Single item in an order
export interface OrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

// Response after creating an order
export interface CreateOrderResponse {
  id: number;
  reference: string;
}

// Payment intent response
export interface PaymentIntentResponse {
  paymentIntentId: string;
  status: string;
}

// Payment confirmation request
export interface PaymentConfirmationRequest {
  paymentIntentId: string;
  status: string;
  errorMessage?: string;
}

// Order detail response
export interface OrderDetailDto {
  id: number;
  reference: string;
  producerKeycloakId: string;
  consumerKeycloakId: string;
  producerInternalId: number;
  customerId: number;
  status: 'accepted' | 'pending' | 'delivered' | 'not_delivered' | 'refused';
  deliveryMode: 'pickup' | 'delivery';
  totalAmount: number;
  createdAt: string;
  items: OrderItemDetailDto[];
}

// Order item detail response
export interface OrderItemDetailDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Standard API error
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

// Custom API error class
export class ApiError extends Error {
  statusCode: number;
  response?: ApiErrorResponse;

  constructor(message: string, statusCode: number, response?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}
