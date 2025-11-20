/**
 * Payment Service Exports
 * 
 * Main entry point for payment service functionality
 */

// Export types separately to avoid Babel warnings
export type {
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse,
    ErrorResponse
} from './paymentApi';

// Export order payment types
export type {
    OrderStatusUpdateRequest,
    OrderStatusUpdateResponse, PaymentRecordRequest,
    PaymentRecordResponse
} from './orderPaymentService';

// Export Stripe Connect types
export type {
    AccountSyncResponse, ConnectedAccountCreateRequest, ConnectedAccountCreateResponse, ConnectedAccountStatusResponse, OnboardingRefreshResponse
} from './stripeConnectService';

// Export Connected Account Payment types
export type {
    ConnectedAccountPaymentIntentRequest,
    ConnectedAccountPaymentIntentResponse
} from './connectedAccountPaymentService';

// Export the error classes (runtime values)
export { PaymentApiError } from './paymentApi';
export { StripeConnectError } from './stripeConnectService';

// Export all from config and services
export * from './connectedAccountPaymentService';
export * from './orderPaymentService';
export * from './paymentConfig';
export * from './paymentService';
export * from './stripeConnectService';

