/**
 * HTTP Client
 * 
 * A lightweight wrapper around fetch for making API requests.
 * Handles JSON parsing, error handling, auth token injection, and retries.
 */

import { ACCOUNT_SERVICE_BASE_URL, API_TIMEOUT, MAX_RETRY_ATTEMPTS, RETRY_BACKOFF_MULTIPLIER, RETRY_DELAY_MS } from '../../constants/Config';
import { ApiError, type ApiErrorResponse, type RequestOptions } from '../account/accountApi';

/**
 * Get auth token from context/storage if available
 * This is a placeholder - you can inject token retrieval logic
 */
let tokenProvider: (() => Promise<string | null>) | null = null;

export function setTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider;
}

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make a fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = API_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Parse error response
 */
async function parseErrorResponse(response: Response): Promise<ApiErrorResponse> {
  try {
    const data = await response.json();
    
    // Log full error details for debugging backend issues
    if (response.status >= 500) {
      console.error('Backend server error:', {
        status: response.status,
        url: response.url,
        error: data.error,
        message: data.message,
        path: data.path,
        timestamp: data.timestamp,
        fullResponse: data
      });
    }
    
    return {
      error: data.error || 'Unknown Error',
      message: data.message || response.statusText,
      statusCode: response.status,
      timestamp: data.timestamp,
      path: data.path,
    };
  } catch {
    return {
      error: 'Parse Error',
      message: response.statusText || 'Failed to parse error response',
      statusCode: response.status,
    };
  }
}

/**
 * Generic HTTP request method with retries
 */
async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  options: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${ACCOUNT_SERVICE_BASE_URL}${path}`;
  const { headers = {}, timeout = API_TIMEOUT, retries = MAX_RETRY_ATTEMPTS } = options;

  // Get auth token if available
  let authToken: string | null = null;
  if (tokenProvider) {
    try {
      authToken = await tokenProvider();
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }

  // Extract Keycloak ID from JWT token
  let keycloakId: string | null = null;
  if (authToken) {
    try {
      // Decode JWT to get the 'sub' claim (Keycloak user ID)
      const base64Url = authToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      keycloakId = payload.sub;
    } catch (error) {
      console.warn('Failed to decode JWT token:', error);
    }
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Add Keycloak ID header if available
  if (keycloakId) {
    requestHeaders['X-Keycloak-Id'] = keycloakId;
  }

  // Build request options
  const fetchOptions: RequestInit & { timeout?: number } = {
    method,
    headers: requestHeaders,
    timeout,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  let lastError: Error | null = null;
  let attempt = 0;

  // Retry loop
  while (attempt <= retries) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      // Handle successful response
      if (response.ok) {
        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json() as T;
        }
        // Return empty object for successful responses with no content
        return {} as T;
      }

      // Handle error response
      const errorResponse = await parseErrorResponse(response);
      throw new ApiError(errorResponse.message, response.status, errorResponse);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is a ConcurrentModificationException (backend race condition)
      if (error instanceof ApiError && 
          error.statusCode === 500 && 
          error.message.includes('ConcurrentModificationException')) {
        console.warn('Backend race condition detected (ConcurrentModificationException), will retry...', {
          attempt: attempt + 1,
          maxRetries: retries + 1,
          url
        });
      }

      // Don't retry on client errors (4xx) except for specific cases
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        if (error.statusCode === 408 || error.statusCode === 429) {
          // Retry on timeout or rate limit
        } else {
          // Don't retry on other client errors
          throw error;
        }
      }

      // If we've exhausted retries, throw
      if (attempt >= retries) {
        // Add helpful message for ConcurrentModificationException
        if (error instanceof ApiError && 
            error.message.includes('ConcurrentModificationException')) {
          console.error('Backend race condition persisted after all retries. This is a backend bug that needs to be fixed.');
        }
        throw error;
      }

      // Calculate backoff delay
      const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt);
      console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, error);
      
      await sleep(delay);
      attempt++;
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Request failed');
}

/**
 * HTTP POST request
 */
export async function httpPost<T = any>(
  path: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>('POST', path, body, options);
}

/**
 * HTTP GET request
 */
export async function httpGet<T = any>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>('GET', path, undefined, options);
}

/**
 * HTTP PUT request
 */
export async function httpPut<T = any>(
  path: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>('PUT', path, body, options);
}

/**
 * HTTP PATCH request
 */
export async function httpPatch<T = any>(
  path: string,
  body?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>('PATCH', path, body, options);
}

/**
 * HTTP DELETE request
 */
export async function httpDelete<T = any>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>('DELETE', path, undefined, options);
}

/**
 * Check if error is a network error (offline)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return true;
  }
  if (error instanceof Error && error.message.includes('Network')) {
    return true;
  }
  if (error instanceof ApiError && error.statusCode === 408) {
    return true;
  }
  return false;
}
