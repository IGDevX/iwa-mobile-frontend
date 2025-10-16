import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../components/AuthContext';
import { router } from 'expo-router';
import { convertKeycloakAttributesToProfile } from '../utils/profileUtils';

interface ProfileData {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    profession: string;
    email: string; // Add email field
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const { state, signOut } = useContext(AuthContext);
    const [profileData, setProfileData] = useState<ProfileData>({
        displayName: '',
        responsibleName: '',
        phoneNumber: '',
        address: '',
        profession: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);

    // Determine user role
    const userRole = state.userInfo?.roles?.[0] || 'Producer';
    const isProducer = userRole === 'Producer';

    // Load profile data when component mounts
    useEffect(() => {
        loadProfileData();
    }, [state.userInfo]);

    // Function to load profile data from Keycloak
    const loadProfileData = async () => {
        try {
            if (!state.userInfo?.sub) {
                setLoading(false);
                return;
            }

            const adminToken = await getKeycloakAdminToken();
            if (!adminToken) {
                console.warn('Could not get admin token to load profile');
                setLoading(false);
                return;
            }

            const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';
            const userId = state.userInfo.sub;

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Accept': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const userData = await response.json();
                const attributes = userData.attributes || {};

                // Load profile data using utility function
                const loadedProfileData = convertKeycloakAttributesToProfile(attributes);

                // Set profile data with email from main user data
                setProfileData({
                    ...loadedProfileData,
                    email: userData.email || userData.username || 'Not provided'
                });
            } else {
                console.warn('Failed to load user profile data');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get admin token (reuse from complete-profile)
    const getKeycloakAdminToken = async (): Promise<string | null> => {
        try {
            const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
            const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
            const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG;

            const formData = new URLSearchParams();
            formData.append('grant_type', 'password');
            formData.append('client_id', 'admin-cli');
            formData.append('username', adminUsername);
            formData.append('password', adminPassword);

            const response = await fetch(
                `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                    body: formData.toString(),
                }
            );

            if (!response.ok) {
                console.error('Failed to get admin token:', response.status);
                return null;
            }

            const tokenData = await response.json();
            return tokenData.access_token;
        } catch (error) {
            console.error('Error getting admin token:', error);
            return null;
        }
    };

    const handleEditProfile = () => {
        // TODO
    };

    const handleSignOut = () => {
        Alert.alert(
            t('profile.signout.title', 'Sign Out'),
            t('profile.signout.message', 'Are you sure you want to sign out?'),
            [
                { text: t('profile.signout.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('profile.signout.confirm', 'Sign Out'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/home-page');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={require('../assets/images/icons8-loading-96.png')} style={[styles.icon]} />
                <Text style={styles.title}>{t('profile.loading', 'Loading profile...')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('profile.title', 'Mon Profil')}</Text>

                {/* Edit Profile Button */}
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Text style={styles.editButtonText}>
                        {t('profile.edit_button', 'Modifier mes informations')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Profile Information Section */}
            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('profile.general_info', 'Informations générales')}
                    </Text>
                </View>

                {/* Display Name */}
                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('profile.complete.display_name', 'Nom d\'affichage')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {profileData.displayName || t('profile.not_provided', 'Non renseigné')}
                    </Text>
                </View>

                {/* Email */}
                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('auth.login.email', 'Email')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {profileData.email || t('profile.not_provided', 'Non renseigné')}
                    </Text>
                </View>

                {/* Responsible Name */}
                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('profile.complete.responsible_name', 'Nom du responsable')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {profileData.responsibleName || t('profile.not_provided', 'Non renseigné')}
                    </Text>
                </View>

                {/* Phone Number */}
                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('profile.complete.phone_number', 'Téléphone')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {profileData.phoneNumber || t('profile.not_provided', 'Non renseigné')}
                    </Text>
                </View>

                {/* Address */}
                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('profile.complete.address', 'Adresse')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {profileData.address || t('profile.not_provided', 'Non renseigné')}
                    </Text>
                </View>

                {/* Profession - Only for Producers */}
                {isProducer && (
                    <View style={styles.infoField}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.profession', 'Profession')}
                        </Text>
                        <Text style={styles.fieldValue}>
                            {profileData.profession || t('profile.not_provided', 'Non renseigné')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Sign Out Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>
                        {t('profile.signout.button', 'Se déconnecter')}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 96,
        height: 96,
        marginBottom: 24,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f7f6ed',
        paddingTop: 50
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 16
    },
    title: {
        fontSize: 18,
        lineHeight: 27,
        color: '#4A4459',
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#89a083',
        borderRadius: 10,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    editButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#fffef4',
        lineHeight: 21,
    },
    infoSection: {
        marginHorizontal: 24,
        backgroundColor: '#eae9e1',
        borderRadius: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        gap: 12,
    },
    sectionHeader: {
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 24,
        fontWeight: '500',
    },
    infoField: {
        gap: 4,
    },
    fieldLabel: {
        fontSize: 13,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 19.5,
    },
    fieldValue: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 22.75,
        fontWeight: '400',
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    signOutButton: {
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signOutButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#ffffff',
        lineHeight: 21,
        fontWeight: '500',
    },
});
