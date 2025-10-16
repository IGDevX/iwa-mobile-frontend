import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Keyboard, Image } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../components/AuthContext';
import Button from '../components/Button';
import { TextInput } from 'react-native';
import { isUserProfileComplete, convertKeycloakAttributesToProfile } from '../utils/profileUtils';

export default function CompletePage() {
    const { t } = useTranslation();
    const { state } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Determine user role - you might need to adjust this based on how roles are stored
    const userRole = state.userInfo?.roles?.[0] || 'Producer'; // Default to Producer if no role
    const isProducer = userRole === 'Producer';
    const isRestaurant = userRole === 'Restaurant Owner';

    // Form state
    const [formData, setFormData] = useState({
        displayName: '',
        responsibleName: '',
        phoneNumber: '',
        address: '',
        profession: '', // Only for producers
    });

    // Load existing profile data when component mounts
    React.useEffect(() => {
        loadExistingProfile();
    }, [state.userInfo]);

    // Function to load existing profile data from Keycloak
    const loadExistingProfile = async () => {
        try {
            if (!state.userInfo?.sub) {
                setInitialLoading(false);
                return;
            }

            const adminToken = await getKeycloakAdminToken();
            if (!adminToken) {
                console.warn('Could not get admin token to load profile');
                setInitialLoading(false);
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

                // Load existing profile data into form using utility function
                const profileData = convertKeycloakAttributesToProfile(attributes);
                setFormData(profileData);
            } else {
                console.warn('Failed to load user profile data');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        // Dismiss keyboard and remove focus from text inputs
        Keyboard.dismiss();

        setLoading(true);

        try {
            // Validate required fields
            if (!formData.displayName || !formData.responsibleName || !formData.phoneNumber || !formData.address) {
                Alert.alert(t('common.error'), t('profile.complete.validation.fill_all_fields'));
                return;
            }

            if (isProducer && !formData.profession) {
                Alert.alert(t('common.error'), t('profile.complete.validation.profession_required'));
                return;
            }

            // Save profile data to Keycloak user attributes
            const success = await saveProfileToKeycloak(formData);

            if (success) {
                Alert.alert(
                    t('profile.complete.success.title'),
                    t('profile.complete.success.message'),
                    [{ text: t('common.ok'), onPress: () => router.replace('/home-page') }]
                );
            } else {
                Alert.alert(t('common.error'), t('profile.complete.error.save_failed'));
            }
        } catch (error) {
            console.error('Profile save error:', error);
            Alert.alert(t('common.error'), t('profile.complete.error.save_failed'));
        } finally {
            setLoading(false);
        }
    };

    // Function to save profile data to Keycloak user attributes
    const saveProfileToKeycloak = async (profileData: typeof formData): Promise<boolean> => {
        try {
            // Get admin token
            const adminToken = await getKeycloakAdminToken();
            if (!adminToken) {
                console.error('Failed to get admin token');
                return false;
            }

            // Get current user ID from AuthContext
            const userId = state.userInfo?.sub; // Keycloak user ID
            if (!userId) {
                console.error('User ID not found');
                return false;
            }

            const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';

            // First, get the current user data to preserve existing attributes
            const getCurrentUserResponse = await fetch(
                `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}`,
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

            // Get email from current user data (email field or username as fallback)
            const userEmail = currentUserData.email || currentUserData.username || '';

            // Prepare user attributes - merge with existing attributes and include email
            const userAttributes: Record<string, string[]> = {
                ...existingAttributes, // Preserve existing attributes
                displayName: [profileData.displayName],
                responsibleName: [profileData.responsibleName],
                phoneNumber: [profileData.phoneNumber],
                address: [profileData.address],
                email: [userEmail] // Always include email in attributes
            };

            // Add profession for producers
            if (isProducer && profileData.profession) {
                userAttributes.profession = [profileData.profession];
            }

            // Create the update payload - update both attributes and main email field
            const updatePayload = {
                email: userEmail, // Also set the main email field
                attributes: userAttributes
            };

            // Update user in Keycloak
            const updateResponse = await fetch(
                `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatePayload)
                }
            );

            if (updateResponse.ok) {
                return true;
            } else {
                const errorText = await updateResponse.text();
                console.error('Failed to update user profile:', errorText);
                return false;
            }
        } catch (error) {
            console.error('Error saving profile to Keycloak:', error);
            return false;
        }
    };

    // Helper function to get admin token (reuse from AuthContext)
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

    const handleSkip = () => {
        Alert.alert(
            t('profile.complete.skip_confirmation.title'),
            t('profile.complete.skip_confirmation.message'),
            [
                { text: t('profile.complete.skip_confirmation.cancel'), style: 'cancel' },
                { text: t('profile.complete.skip_confirmation.continue'), onPress: () => router.replace('/home-page') }
            ]
        );
    };

    if (initialLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={require('../assets/images/icons8-loading-96.png')} style={[styles.icon]}/>
                <Text style={styles.title}>{t('profile.loading', 'Loading profile...')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('profile.complete.title')}</Text>
                <Text style={styles.subtitle}>
                    {isProducer ? t('profile.complete.subtitle_producer') : t('profile.complete.subtitle_restaurant')}
                </Text>
            </View>

            <View style={styles.form}>
                {/* Display Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('profile.complete.display_name')}</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder={isProducer ? t('profile.complete.display_name_placeholder_producer') : t('profile.complete.display_name_placeholder_restaurant')}
                        value={formData.displayName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                        placeholderTextColor="rgba(74, 68, 89, 0.5)"
                    />
                </View>

                {/* Responsible Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('profile.complete.responsible_name')}</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder={isProducer ? t('profile.complete.responsible_name_placeholder_producer') : t('profile.complete.responsible_name_placeholder_restaurant')}
                        value={formData.responsibleName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, responsibleName: text }))}
                        placeholderTextColor="rgba(74, 68, 89, 0.5)"
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('profile.complete.phone_number')}</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder={isProducer ? t('profile.complete.phone_placeholder_producer') : t('profile.complete.phone_placeholder_restaurant')}
                        value={formData.phoneNumber}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                        keyboardType="phone-pad"
                        placeholderTextColor="rgba(74, 68, 89, 0.5)"
                    />
                </View>

                {/* Address */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('profile.complete.address')}</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder={isProducer ? t('profile.complete.address_placeholder_producer') : t('profile.complete.address_placeholder_restaurant')}
                        value={formData.address}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                        placeholderTextColor="rgba(74, 68, 89, 0.5)"
                    />
                </View>

                {/* Profession - Only for Producers */}
                {isProducer && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.complete.profession')}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={t('profile.complete.profession_placeholder')}
                            value={formData.profession}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, profession: text }))}
                            placeholderTextColor="rgba(74, 68, 89, 0.5)"
                        />
                    </View>
                )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    title={t('profile.complete.save')}
                    onPress={handleSave}
                    disabled={loading}
                    style={{
                        ...styles.saveButton,
                        ...(isProducer ? styles.producerButton : styles.restaurantButton)
                    }}
                    textStyle={{
                        ...styles.saveButtonText,
                        ...(isProducer ? styles.producerButtonText : styles.restaurantButtonText)
                    }}
                />

                <Button
                    title={t('profile.complete.skip')}
                    onPress={handleSkip}
                    style={styles.skipButton}
                    textStyle={styles.skipButtonText}
                />
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
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        lineHeight: 27,
        color: '#4A4459',
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    form: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#eae9e1',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        minHeight: 48,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
    },
    saveButton: {
        borderRadius: 16,
        height: 55,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    producerButton: {
        backgroundColor: '#89a083',
    },
    restaurantButton: {
        backgroundColor: '#e8dfda',
    },
    saveButtonText: {
        fontSize: 18,
        fontFamily: 'Roboto',
        color: '#fffef4',
    },

    producerButtonText: {
        fontSize: 18,
        fontFamily: 'Roboto',
        color: '#FFFEF4'
    },
    restaurantButtonText: {
        fontSize: 18,
        fontFamily: 'Roboto',
        color: '#4A4459'
    },
    skipButton: {
        backgroundColor: 'transparent',
        height: 37,
    },
    skipButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        textDecorationLine: 'underline',
    },
});
