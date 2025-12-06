/**
 * Image Service Configuration
 */

import { API_GATEWAY_BASE_URL } from '../../constants/Config';

const IMAGE_PREFIX = '/image';

export const IMAGE_ENDPOINTS = {
  // Upload product image
  UPLOAD_PRODUCT_IMAGE: `${API_GATEWAY_BASE_URL}${IMAGE_PREFIX}/upload/product`,
} as const;

/**
 * Détermine si un endpoint Image est public
 */
export function isPublicImageEndpoint(url: string, method: string): boolean {
  // Tous les uploads sont privés (nécessitent authentification)
  return false;
}

