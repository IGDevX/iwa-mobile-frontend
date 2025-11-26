/**
 * Image Service HTTP Client
 *
 * Client HTTP pour le Image Service via l'API Gateway
 * Gère l'upload d'images avec multipart/form-data
 */

import { TokenManager } from '../auth/tokenManager';
import { isPublicImageEndpoint } from './imageConfig';


/**
 * Upload une image (multipart/form-data)
 */
export async function uploadImage(
  url: string,
  file: { uri: string; name: string; type: string }
): Promise<any> {
  const isPublic = isPublicImageEndpoint(url, 'POST');

  // Créer FormData pour React Native
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const headers: Record<string, string> = {};

  // Ajouter le token pour les routes privées
  if (!isPublic) {
    const token = await TokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Ne PAS définir Content-Type manuellement pour multipart/form-data
  // React Native le fait automatiquement avec la bonne boundary

  console.log('📤 [IMAGE] Uploading to:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [IMAGE] Upload failed:', response.status, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const responseData = await response.json();
  console.log('✅ [IMAGE] Upload successful:', JSON.stringify(responseData, null, 2));

  return responseData;
}

