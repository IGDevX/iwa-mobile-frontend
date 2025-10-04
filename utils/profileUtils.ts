// Utility functions for profile management

export interface ProfileData {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    profession: string;
}

export interface UserAttributes {
    displayName?: string[];
    responsibleName?: string[];
    phoneNumber?: string[];
    address?: string[];
    profession?: string[];
}

/**
 * Check if a user's profile is complete based on their role and profile data
 * @param profileData - The user's profile data
 * @param userRole - The user's role ('Producer' or 'Restaurant Owner')
 * @returns boolean indicating if profile is complete
 */
export const isUserProfileComplete = (profileData: ProfileData, userRole: string): boolean => {
    const requiredFields = ['displayName', 'responsibleName', 'phoneNumber', 'address'];
    
    // Check basic required fields
    const basicFieldsComplete = requiredFields.every(field => 
        profileData[field as keyof ProfileData]?.trim()
    );
    
    // For producers, also check profession
    if (userRole === 'Producer') {
        return basicFieldsComplete && Boolean(profileData.profession?.trim());
    }
    
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
        profession: attributes.profession?.[0] || '',
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
    
    // Add profession for producers
    if (userRole === 'Producer') {
        requiredFields.push('profession');
    }
    
    return requiredFields.filter(field => 
        !profileData[field as keyof ProfileData]?.trim()
    );
};