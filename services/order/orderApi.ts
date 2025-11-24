/**
 * Order API helper
 * Uses environment variables to determine gateway/base URL.
 */

const GATEWAY_BASE = (process.env.EXPO_PUBLIC_ORDER_URL)
  || (process.env.EXPO_PUBLIC_API_BASE_URL ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/order` : undefined)
  || (process.env.EXPO_PUBLIC_PAYMENT_URL ? `${process.env.EXPO_PUBLIC_PAYMENT_URL}/order` : undefined)
  || 'http://localhost:8080/order';

const ORDER_ENDPOINT = `${GATEWAY_BASE}/orders`;

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string,string> || {})
  };

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function createOrder(payload: any, idempotencyKey?: string) {
  const headers: Record<string,string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return request(ORDER_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

export async function listOrders(params: Record<string,string|number|undefined> = {}) {
  const qs = Object.entries(params)
    .filter(([,v]) => v !== undefined && v !== null)
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = qs ? `${ORDER_ENDPOINT}?${qs}` : ORDER_ENDPOINT;
  return request(url, { method: 'GET' });
}

export async function getOrderById(id: string) {
  const url = `${ORDER_ENDPOINT}/${encodeURIComponent(id)}`;
  return request(url, { method: 'GET' });
}

export async function createPaymentIntentForOrder(reference: string) {
  const url = `${ORDER_ENDPOINT}/${encodeURIComponent(reference)}/payment-intent`;
  return request(url, { method: 'POST' });
}

export default {
  createOrder,
  listOrders,
  getOrderById,
  createPaymentIntentForOrder,
};
