import { HttpClient } from '../shared/httpClient';
import { API_GATEWAY_BASE_URL } from '../../constants/Config';


// HttpClient for Payment Service endpoints
const paymentClient = new HttpClient(`${API_GATEWAY_BASE_URL}/payment`);
// HttpClient for Stripe Connect endpoints
const stripeClient = new HttpClient(`${API_GATEWAY_BASE_URL}/account/stripe`);

/**
 * Make a GET request to a Payment endpoint
 */
export async function paymentGet<T>(endpoint: string): Promise<T> {
  return paymentClient.get<T>(endpoint);
}

/**
 * Make a POST request to a Payment endpoint
 */
export async function paymentPost<T>(endpoint: string, body?: any): Promise<T> {
  return paymentClient.post<T>(endpoint, body);
}

/**
 * Make a PATCH request to a Payment endpoint
 */
export async function paymentPatch<T>(endpoint: string, body: any): Promise<T> {
  return paymentClient.patch<T>(endpoint, body);
}

/**
 * Make a DELETE request to a Payment endpoint
 */
export async function paymentDelete<T>(endpoint: string): Promise<T> {
  return paymentClient.delete<T>(endpoint);
}

/**
 * Make a GET request to a Stripe endpoint
 */
export async function stripeGet<T>(endpoint: string): Promise<T> {
  return stripeClient.get<T>(endpoint);
}

/**
 * Make a POST request to a Stripe endpoint
 */
export async function stripePost<T>(endpoint: string, body?: any): Promise<T> {
  return stripeClient.post<T>(endpoint, body);
}

/**
 * Make a DELETE request to a Stripe endpoint
 */
export async function stripeDelete<T>(endpoint: string): Promise<T> {
  return stripeClient.delete<T>(endpoint);
}
