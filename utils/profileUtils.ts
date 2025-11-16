// Utility functions for profile management

export interface ProfileData {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
}

export interface UserAttributes {
    displayName?: string[];
    responsibleName?: string[];
    phoneNumber?: string[];
    address?: string[];
}

/**
 * Check if a user's profile is complete based on their role and profile data
 * @param profileData - The user's profile data
 * @param userRole - The user's role ('Producer' or 'Restaurant Owner')
 * @returns boolean indicating if profile is complete
 */
export const isUserProfileComplete = (profileData: ProfileData, userRole: string): boolean => {
    const requiredFields = ['displayName', 'responsibleName', 'phoneNumber', 'address'];
    
    // Check basic required fields only (profession is managed by Account Service)
    const basicFieldsComplete = requiredFields.every(field =>
        Boolean(profileData[field as keyof ProfileData]?.trim())
    );

    return basicFieldsComplete;
};

/**
 * Convert Keycloak user attributes to ProfileData format
 * @param attributes - Keycloak user attributes
 * @returns ProfileData object
 */
export const convertKeycloakAttributesToProfile = (attributes: UserAttributes): ProfileData => {
    return {
        displayName: attributes.displayName?.[0] || '',
        responsibleName: attributes.responsibleName?.[0] || '',
        phoneNumber: attributes.phoneNumber?.[0] || '',
        address: attributes.address?.[0] || '',
    };
};

/**
 * Get missing profile fields for a user
 * @param profileData - The user's profile data
 * @param userRole - The user's role ('Producer' or 'Restaurant Owner')
 * @returns Array of missing field names
 */
export const getMissingProfileFields = (profileData: ProfileData, userRole: string): string[] => {
    const requiredFields = ['displayName', 'responsibleName', 'phoneNumber', 'address'];
    
    // profession is managed by Account Service; only core fields are required here
    return requiredFields.filter(field => !profileData[field as keyof ProfileData]?.trim());
};