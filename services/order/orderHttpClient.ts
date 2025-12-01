import { TokenManager } from '../auth/tokenManager';
import { ApiError, ApiErrorResponse } from './orderApi';

export async function request<T>(url: string, options: RequestInit = {}, serviceToken?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (serviceToken) headers['X-Service-Token'] = serviceToken;
  else {
    const token = await TokenManager.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let body: ApiErrorResponse | undefined;
    try {
      body = text ? JSON.parse(text) as ApiErrorResponse : undefined;
    } catch {
      // If response is not JSON (e.g., plain text "Not Found"), ignore it
      body = undefined;
    }
    throw new ApiError(`HTTP ${res.status} ${res.statusText}`, res.status, body);
  }

  if (res.status === 204) return null as unknown as T;
  
  const text = await res.text();
  if (!text) return null as unknown as T;
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Invalid JSON response from server');
  }
}
