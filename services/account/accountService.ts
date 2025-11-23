/**
 * Account Service
 * 
 * API service pour interagir avec le Account Service via l'API Gateway.
 * Gère la création, récupération et mise à jour des profils utilisateurs.
 *
 * Architecture : Toutes les requêtes passent par localhost:8080/account
 */

import { accountDelete, accountGet, accountPost, accountPut } from './accountHttpClient';
import { addPendingNotification, removePendingNotification } from '../shared/retryQueue';
import { isNetworkError } from '../shared/httpClient';
import {
    ApiError,
    type ProducerProfileRequest,
    type ProducerPublicProfileResponse,
    type Profession,
    type RestaurantProfileRequest,
    type RestaurantPublicProfileResponse,
    type UpdatePersonalInfoRequest,
    type UserProfileResponse
} from './accountApi';
import { ACCOUNT_ENDPOINTS } from './accountConfig';

// ============================================
// Profile Creation Functions
// ============================================

/**
 * Create or complete a producer profile
 * Requires authentication - X-Keycloak-Id header will be added automatically
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Producer profile data
 * @returns Created/updated user profile
 * @throws ApiError if the request fails
 */
export async function createProducerProfile(
  keycloakId: string,
  request: ProducerProfileRequest
): Promise<UserProfileResponse> {
  try {
    const response = await accountPost<UserProfileResponse>(
      ACCOUNT_ENDPOINTS.CREATE_PRODUCER,
      request,
      {
        headers: {
          'X-Keycloak-Id': keycloakId,
        },
      }
    );

    // Remove from pending queue if it was queued
    await removePendingNotification(keycloakId);

    return response;
  } catch (error) {
    // If it's a network error, queue for retry
    if (isNetworkError(error)) {
      console.warn('Network error during producer profile creation, queuing for retry...');
      await addPendingNotification({
        keycloakId,
        role: 'Producer',
        ...request,
      });
    }

    // Re-throw the error so caller can handle it
    throw error;
  }
}

/**
 * Create or complete a restaurant profile
 * Requires authentication - X-Keycloak-Id header will be added automatically
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Restaurant profile data
 * @returns Created/updated user profile
 * @throws ApiError if the request fails
 */
export async function createRestaurantProfile(
  keycloakId: string,
  request: RestaurantProfileRequest
): Promise<UserProfileResponse> {
  try {
    const response = await accountPost<UserProfileResponse>(
      ACCOUNT_ENDPOINTS.CREATE_RESTAURANT,
      request,
      {
        headers: {
          'X-Keycloak-Id': keycloakId,
        },
      }
    );

    // Remove from pending queue if it was queued
    await removePendingNotification(keycloakId);

    return response;
  } catch (error) {
    // If it's a network error, queue for retry
    if (isNetworkError(error)) {
      console.warn('Network error during restaurant profile creation, queuing for retry...');
      await addPendingNotification({
        keycloakId,
        role: 'Restaurant',
        ...request,
      });
    }

    // Re-throw the error so caller can handle it
    throw error;
  }
}

// ============================================
// Profile Retrieval Functions
// ============================================

/**
 * Get connected user's full profile
 * Requires authentication
 * 
 * @returns Full user profile
 */
export async function getMyProfile(): Promise<UserProfileResponse> {
  return accountGet<UserProfileResponse>(ACCOUNT_ENDPOINTS.ME);
}

/**
 * Get producer's public profile
 * 
 * @param id - Producer ID
 * @returns Public producer profile
 */
export async function getProducerPublicProfile(
  id: string
): Promise<ProducerPublicProfileResponse> {
  return accountGet<ProducerPublicProfileResponse>(
    ACCOUNT_ENDPOINTS.GET_PRODUCER(id)
  );
}

/**
 * Get restaurant's public profile
 * 
 * @param id - Restaurant ID
 * @returns Public restaurant profile
 */
export async function getRestaurantPublicProfile(
  id: string
): Promise<RestaurantPublicProfileResponse> {
  return accountGet<RestaurantPublicProfileResponse>(
    ACCOUNT_ENDPOINTS.GET_RESTAURANT(id)
  );
}

/**
 * Get or create user by Keycloak ID (Internal API)
 * Auto-creates user if they don't exist (idempotent operation)
 * 
 * @param keycloakId - Keycloak user ID
 * @returns User profile (existing or newly created)
 */
export async function getUserByKeycloakId(
  keycloakId: string
): Promise<UserProfileResponse> {
  const endpoint = ACCOUNT_ENDPOINTS.INTERNAL_BY_KEYCLOAK_ID(keycloakId);
  
  try {
    // Use GET endpoint which auto-creates user if not exists
    const result = await accountGet<UserProfileResponse>(
      endpoint,
      {
        headers: {
          'X-Keycloak-Id': keycloakId,
        }
      }
    );
    return result;
  } catch (error) {
    console.error('[getUserByKeycloakId] Failed:', error);
    if (error instanceof ApiError) {
      console.error('[getUserByKeycloakId] API Error Details:', {
        status: error.statusCode,
        message: error.message,
        response: error.response
      });
    }
    throw error;
  }
}

/**
 * Get available professions managed by Account Service
 * Master data for all available professions
 * @returns array of professions
 */
export async function getProfessions(): Promise<Profession[]> {
  return accountGet<Profession[]>(ACCOUNT_ENDPOINTS.GET_PROFESSIONS as string);
}

/**
 * Get a specific profession by ID
 * @param id - Profession ID
 * @returns profession object
 */
export async function getProfessionById(id: string): Promise<Profession> {
  return accountGet<Profession>(ACCOUNT_ENDPOINTS.GET_PROFESSION_BY_ID(id));
}

// ============================================
// Profile Update Functions
// ============================================

/**
 * Update personal information
 * Requires authentication
 * 
 * @param request - Updated personal info
 * @returns Updated user profile
 */
export async function updatePersonalInfo(
  request: UpdatePersonalInfoRequest
): Promise<UserProfileResponse> {
  return accountPut<UserProfileResponse>(ACCOUNT_ENDPOINTS.UPDATE_ME, request);
}

/**
 * Update producer profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Updated producer info (professionIds should be managed via separate endpoints)
 * @returns Updated user profile
 */
export async function updateProducerProfile(
  keycloakId: string,
  request: ProducerProfileRequest
): Promise<UserProfileResponse> {
  return accountPut<UserProfileResponse>(
    ACCOUNT_ENDPOINTS.UPDATE_PRODUCER,
    request,
    {
      headers: {
        'X-Keycloak-Id': keycloakId,
      },
    }
  );
}

/**
 * Update restaurant profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Updated restaurant info
 * @returns Updated user profile
 */
export async function updateRestaurantProfile(
  keycloakId: string,
  request: RestaurantProfileRequest
): Promise<UserProfileResponse> {
  return accountPut<UserProfileResponse>(
    ACCOUNT_ENDPOINTS.UPDATE_RESTAURANT,
    request,
    {
      headers: {
        'X-Keycloak-Id': keycloakId,
      },
    }
  );
}

// ============================================
// Producer Professions Management (NEW)
// ============================================

/**
 * Add a profession to producer profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 * @param professionId - Profession ID to add
 * @returns Updated user profile
 */
export async function addProducerProfession(
  keycloakId: string,
  professionId: number
): Promise<UserProfileResponse> {
  return accountPost<UserProfileResponse>(
    ACCOUNT_ENDPOINTS.ADD_PRODUCER_PROFESSION(professionId),
    {},
    {
      headers: {
        'X-Keycloak-Id': keycloakId,
      },
    }
  );
}

/**
 * Remove a profession from producer profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 * @param professionId - Profession ID to remove
 */
export async function removeProducerProfession(
  keycloakId: string,
  professionId: number
): Promise<void> {
  await accountDelete(
    ACCOUNT_ENDPOINTS.REMOVE_PRODUCER_PROFESSION(professionId),
    {
      headers: {
        'X-Keycloak-Id': keycloakId,
      },
    }
  );
}

// ============================================
// Profile Deletion Functions
// ============================================

/**
 * Delete producer profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 */
export async function deleteProducerProfile(keycloakId: string): Promise<void> {
  await accountDelete(ACCOUNT_ENDPOINTS.DELETE_PRODUCER, {
    headers: {
      'X-Keycloak-Id': keycloakId,
    },
  });
}

/**
 * Delete restaurant profile
 * Requires authentication - uses X-Keycloak-Id header
 * 
 * @param keycloakId - Keycloak user ID
 */
export async function deleteRestaurantProfile(keycloakId: string): Promise<void> {
  await accountDelete(ACCOUNT_ENDPOINTS.DELETE_RESTAURANT, {
    headers: {
      'X-Keycloak-Id': keycloakId,
    },
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a user profile exists
 * 
 * @param keycloakId - The Keycloak user ID to check
 * @returns true if user exists, false otherwise
 */
export async function checkUserExists(keycloakId: string): Promise<boolean> {
  try {
    await getUserByKeycloakId(keycloakId);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Ensure producer profile exists (idempotent)
 * Creates profile if it doesn't exist, returns existing one otherwise
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Producer profile data
 * @returns User profile
 */
export async function ensureProducerProfileExists(
  keycloakId: string,
  request: ProducerProfileRequest
): Promise<UserProfileResponse> {
  try {
    // First check if user already has a profile
    const existingUser = await getUserByKeycloakId(keycloakId);
    console.log('Producer profile already exists:', existingUser.id);
    return existingUser;
  } catch (error) {
    // If 404, user doesn't have a profile - create it
    if (error instanceof ApiError && error.statusCode === 404) {
      console.log('Producer profile not found, creating...');
      return createProducerProfile(keycloakId, request);
    }
    // Other errors, re-throw
    throw error;
  }
}

/**
 * Ensure restaurant profile exists (idempotent)
 * Creates profile if it doesn't exist, returns existing one otherwise
 * 
 * @param keycloakId - Keycloak user ID
 * @param request - Restaurant profile data
 * @returns User profile
 */
export async function ensureRestaurantProfileExists(
  keycloakId: string,
  request: RestaurantProfileRequest
): Promise<UserProfileResponse> {
  try {
    // First check if user already has a profile
    const existingUser = await getUserByKeycloakId(keycloakId);
    console.log('Restaurant profile already exists:', existingUser.id);
    return existingUser;
  } catch (error) {
    // If 404, user doesn't have a profile - create it
    if (error instanceof ApiError && error.statusCode === 404) {
      console.log('Restaurant profile not found, creating...');
      return createRestaurantProfile(keycloakId, request);
    }
    // Other errors, re-throw
    throw error;
  }
}

// ============================================
// Combined Profile Functions (Keycloak + Account Service)
// ============================================

/**
 * Get complete user profile combining Keycloak and Account Service data
 * 
 * @param keycloakId - Keycloak user ID
 * @param getKeycloakAdminToken - Function to get admin token for Keycloak API
 * @returns Combined profile data
 */
export async function getCompleteUserProfile(
  keycloakId: string,
  getKeycloakAdminToken: () => Promise<string | null>
): Promise<{
  keycloak: {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    email: string;
    profession?: string;
  };
  accountService: UserProfileResponse;
}> {
  try {
    // Get Keycloak data with timeout
    const adminToken = await getKeycloakAdminToken();
    if (!adminToken) {
      throw new Error('Failed to get admin token');
    }

    const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';
    const keycloakUrl = `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${keycloakId}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const keycloakResponse = await fetch(keycloakUrl, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!keycloakResponse.ok) {
        console.error('Keycloak API error:', keycloakResponse.status, await keycloakResponse.text());
        throw new Error(`Failed to fetch Keycloak user data: ${keycloakResponse.status}`);
      }

      const keycloakData = await keycloakResponse.json();
      const attributes = keycloakData.attributes || {};

      // Get Account Service data
      const accountServiceData = await getUserByKeycloakId(keycloakId);

      return {
        keycloak: {
          displayName: attributes.displayName?.[0] || '',
          responsibleName: attributes.responsibleName?.[0] || '',
          phoneNumber: attributes.phoneNumber?.[0] || '',
          address: attributes.address?.[0] || '',
          email: keycloakData.email || keycloakData.username || '',
          profession: attributes.profession?.[0] || undefined,
        },
        accountService: accountServiceData
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Keycloak API timeout');
        throw new Error('Request to Keycloak timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in getCompleteUserProfile:', error);
    throw error;
  }
}

/**
 * Update complete user profile (both Keycloak and Account Service)
 * 
 * @param keycloakId - Keycloak user ID
 * @param accountServiceId - Account Service user ID
 * @param keycloakData - Data to update in Keycloak (displayName, responsibleName, etc.)
 * @param accountServiceData - Data to update in Account Service (biography, website, etc.)
 * @param role - User role ('Producer' or 'Restaurant Owner')
 * @param getKeycloakAdminToken - Function to get admin token for Keycloak API
 * @returns Success status
 */
export async function updateCompleteUserProfile(
  keycloakId: string,
  accountServiceId: string,
  keycloakData: {
    displayName?: string;
    responsibleName?: string;
    phoneNumber?: string;
    address?: string;
    profession?: string;
  },
  accountServiceData: ProducerProfileRequest | RestaurantProfileRequest,
  role: 'Producer' | 'Restaurant Owner',
  getKeycloakAdminToken: () => Promise<string | null>
): Promise<boolean> {
  try {
    // Update Keycloak attributes
    const adminToken = await getKeycloakAdminToken();
    if (!adminToken) {
      throw new Error('Failed to get admin token');
    }

    const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';

    // Get current user data to preserve existing attributes
    const getCurrentUserResponse = await fetch(
      `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${keycloakId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
        }
      }
    );

    let existingAttributes = {};
    let currentUserData: any = {};
    if (getCurrentUserResponse.ok) {
      currentUserData = await getCurrentUserResponse.json();
      existingAttributes = currentUserData.attributes || {};
    }

    // Prepare updated attributes
    const updatedAttributes: Record<string, string[]> = {
      ...existingAttributes,
    };

    if (keycloakData.displayName) updatedAttributes.displayName = [keycloakData.displayName];
    if (keycloakData.responsibleName) updatedAttributes.responsibleName = [keycloakData.responsibleName];
    if (keycloakData.phoneNumber) updatedAttributes.phoneNumber = [keycloakData.phoneNumber];
    if (keycloakData.address) updatedAttributes.address = [keycloakData.address];
    if (keycloakData.profession) updatedAttributes.profession = [keycloakData.profession];

    // Update Keycloak user
    const updateKeycloakResponse = await fetch(
      `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${keycloakId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: updatedAttributes
        })
      }
    );

    if (!updateKeycloakResponse.ok) {
      const errorText = await updateKeycloakResponse.text();
      console.error('Failed to update Keycloak user:', errorText);
      throw new Error('Failed to update Keycloak data');
    }

    // Update Account Service data
    if (role === 'Producer') {
      await updateProducerProfile(accountServiceId, accountServiceData as ProducerProfileRequest);
    } else {
      await updateRestaurantProfile(accountServiceId, accountServiceData as RestaurantProfileRequest);
    }

    return true;
  } catch (error) {
    console.error('Error updating complete user profile:', error);
    throw error;
  }
}
