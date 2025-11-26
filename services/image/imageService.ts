/**
 * Image Service
 *
 * API pour uploader des images vers le Image Service
 */

import { uploadImage } from './imageHttpClient';
import { IMAGE_ENDPOINTS } from './imageConfig';

export interface ImageUploadResponse {
  imageId: string;
  fileName: string;
  cloudPath: string;
  url: string;
  sizeBytes: number;
  message: string;
}

/**
 * Upload une image de produit
 * @param file - Fichier image à uploader
 * @param productId - ID du produit
 * @param userId - ID de l'utilisateur propriétaire
 * @returns Métadonnées de l'image uploadée
 */
export async function uploadProductImage(
  file: { uri: string; name: string; type: string },
  productId: string,
  userId: string
): Promise<ImageUploadResponse> {
  const url = `${IMAGE_ENDPOINTS.UPLOAD_PRODUCT_IMAGE}?productId=${productId}&userId=${userId}`;
  return uploadImage(url, file);
}

