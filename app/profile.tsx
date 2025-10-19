import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../components/AuthContext';
import { router } from 'expo-router';
import { convertKeycloakAttributesToProfile } from '../utils/profileUtils';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileData {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    profession: string;
    email: string;
}

// Mock data for restaurant owner
const mockRestaurantData = {
    biography: "Restaurant gastronomique au cœur de Paris, nous proposons une cuisine française moderne avec des produits locaux et de saison. Notre chef étoilé crée des plats d'exception dans une ambiance raffinée.",
    serviceType: "Restaurant gastronomique",
    cuisineType: "Cuisine française moderne",
    installationYear: "2018",
    employeesCount: "8-12 employés",
    hygieneCertifications: ["HACCP", "Certification Hygiène Alimentaire"],
    awards: ["1 étoile Michelin", "Trophée du Meilleur Restaurant 2023"],
    website: "www.restaurant-le-gourmet.fr",
    socialNetworks: {
        facebook: "restaurantlegourmet",
        instagram: "legourmet_paris",
        twitter: "gourmetparis"
    }
};

// Mock data for producer
const mockProducerData = {
    biography: "Ferme familiale depuis 3 générations, spécialisée dans la production de légumes bio et de fruits de saison. Nous cultivons nos produits dans le respect de l'environnement et des traditions agricoles.",
    professions: ["Maraîcher", "Producteur de fruits"],
    siret: "12345678901234",
    organizationType: "Exploitation agricole individuelle",
    productTypes: ["Légumes bio", "Fruits de saison", "Aromates"],
    installationYear: "2015",
    employeesCount: "3-5 employés",
    certifications: ["Agriculture Biologique", "Demeter", "Label Rouge"],
    website: "www.ferme-bio-soleil.fr",
    socialNetworks: {
        facebook: "fermebiosoleil",
        instagram: "ferme_bio_soleil",
        twitter: "fermesoleil"
    }
};

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
    const rotateValue = useRef(new Animated.Value(0)).current;

    // Determine user role
    const userRole = state.userInfo?.roles?.[0] || 'Producer';
    const isProducer = userRole === 'Producer';

    // Helper component for field with icon
    const FieldWithIcon = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
        <View style={styles.infoFieldWithIcon}>
            <View style={styles.fieldWithIconHeader}>
                <Ionicons name={icon as any} size={16} color="#89A083" style={styles.fieldIcon} />
                <Text style={styles.fieldLabel}>{label}</Text>
            </View>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );

    // Helper component for tags
    const TagsList = ({ tags }: { tags: string[] }) => (
        <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
        </View>
    );

    // Helper component for social networks
    const SocialNetworks = ({ networks }: { networks: any }) => (
        <View style={styles.socialContainer}>
            <View style={styles.socialItem}>
                <Ionicons name="logo-facebook" size={16} color="#4A4459" />
                <Text style={styles.socialText}>{networks.facebook}</Text>
            </View>
            <View style={styles.socialItem}>
                <Ionicons name="logo-instagram" size={16} color="#4A4459" />
                <Text style={styles.socialText}>{networks.instagram}</Text>
            </View>
            <View style={styles.socialItem}>
                <Ionicons name="logo-twitter" size={16} color="#4A4459" />
                <Text style={styles.socialText}>{networks.twitter}</Text>
            </View>
        </View>
    );

    // Load profile data when component mounts
    useEffect(() => {
        loadProfileData();
    }, [state.userInfo]);

    // Animation for loading icon
    useEffect(() => {
        if (loading) {
            const rotateAnimation = Animated.loop(
                Animated.timing(rotateValue, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            );
            rotateAnimation.start();

            return () => {
                rotateAnimation.stop();
                rotateValue.setValue(0);
            };
        }
    }, [loading, rotateValue]);

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
        router.push('/edit-profile');
    };

    const handleBack = () => {
        router.back();
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
                        router.replace('/restaurant/home/restaurant-home');
                    }
                }
            ]
        );
    };

    // Create rotation interpolation
    const rotate = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Animated.Image
                    source={require('../assets/images/icons8-loading-96.png')}
                    style={[styles.icon, { transform: [{ rotate }] }]}
                />
                <Text style={styles.title}>{t('profile.loading', 'Loading profile...')}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="chevron-back" size={20} color="#4A4459" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('profile.title', 'Mon Profil')}</Text>
                </View>

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
                        {profileData.displayName || (isProducer ? 'Ferme Bio du Soleil' : 'Restaurant Le Gourmet')}
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
                        {profileData.responsibleName || (isProducer ? 'Marie Dupont' : 'Pierre Martin')}
                    </Text>
                </View>

                {/* Professions for Producer OR Address for both */}
                {isProducer ? (
                    <FieldWithIcon
                        icon="briefcase-outline"
                        label={t('profile.professions')}
                        value=""
                    />
                ) : null}
                {isProducer && (
                    <TagsList tags={mockProducerData.professions} />
                )}

                {/* Address */}
                <FieldWithIcon
                    icon="location-outline"
                    label={t('profile.complete.address')}
                    value={profileData.address || (isProducer ? '123 Route de la Campagne, 69000 Lyon' : '45 Rue de la Gastronomie, 75001 Paris')}
                />

                {/* Phone Number */}
                <FieldWithIcon
                    icon="call-outline"
                    label={t('profile.complete.phone_number')}
                    value={profileData.phoneNumber || (isProducer ? '04 78 12 34 56' : '01 42 33 44 55')}
                />
            </View>

            {/* Biography Section */}
            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('profile.biography')}
                    </Text>
                </View>

                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>
                        {t('profile.about')}
                    </Text>
                    <Text style={styles.fieldValue}>
                        {isProducer ? mockProducerData.biography : mockRestaurantData.biography}
                    </Text>
                </View>
            </View>

            {/* Role-specific sections */}
            {isProducer ? (
                <>
                    {/* Company Information - Producer */}
                    <View style={styles.infoSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('profile.company_info')}
                            </Text>
                        </View>

                        <View style={styles.infoField}>
                            <Text style={styles.fieldLabel}>{t('profile.siret')}</Text>
                            <Text style={styles.fieldValue}>{mockProducerData.siret}</Text>
                        </View>

                        <View style={styles.infoField}>
                            <Text style={styles.fieldLabel}>{t('profile.organization_type')}</Text>
                            <Text style={styles.fieldValue}>{mockProducerData.organizationType}</Text>
                        </View>

                        <View style={styles.infoField}>
                            <Text style={styles.fieldLabel}>{t('profile.product_types')}</Text>
                        </View>
                        <TagsList tags={mockProducerData.productTypes} />

                        <FieldWithIcon
                            icon="calendar-outline"
                            label={t('profile.installation_year')}
                            value={mockProducerData.installationYear}
                        />

                        <FieldWithIcon
                            icon="people-outline"
                            label={t('profile.employees_count')}
                            value={mockProducerData.employeesCount}
                        />
                    </View>

                    {/* Certifications - Producer */}
                    <View style={styles.infoSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('profile.certifications_labels')}
                            </Text>
                        </View>

                        <FieldWithIcon
                            icon="ribbon-outline"
                            label={t('profile.certifications')}
                            value=""
                        />
                        <TagsList tags={mockProducerData.certifications} />
                    </View>
                </>
            ) : (
                <>
                    {/* Restaurant Information */}
                    <View style={styles.infoSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('profile.restaurant_info')}
                            </Text>
                        </View>

                        <FieldWithIcon
                            icon="restaurant-outline"
                            label={t('profile.service_type')}
                            value={mockRestaurantData.serviceType}
                        />

                        <View style={styles.infoField}>
                            <Text style={styles.fieldLabel}>{t('profile.cuisine_type')}</Text>
                            <Text style={styles.fieldValue}>{mockRestaurantData.cuisineType}</Text>
                        </View>

                        <FieldWithIcon
                            icon="calendar-outline"
                            label={t('profile.installation_year')}
                            value={mockRestaurantData.installationYear}
                        />

                        <FieldWithIcon
                            icon="people-outline"
                            label={t('profile.employees_count')}
                            value={mockRestaurantData.employeesCount}
                        />
                    </View>

                    {/* Certifications and Awards - Restaurant */}
                    <View style={styles.infoSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('profile.certifications')}
                            </Text>
                        </View>

                        <FieldWithIcon
                            icon="shield-checkmark-outline"
                            label={t('profile.hygiene_certifications')}
                            value=""
                        />
                        <TagsList tags={mockRestaurantData.hygieneCertifications} />

                        <FieldWithIcon
                            icon="trophy-outline"
                            label={t('profile.awards')}
                            value=""
                        />
                        <TagsList tags={mockRestaurantData.awards} />
                    </View>
                </>
            )}

            {/* Online Presence Section */}
            <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('profile.online_presence')}
                    </Text>
                </View>

                <FieldWithIcon
                    icon="globe-outline"
                    label={t('profile.website')}
                    value={isProducer ? mockProducerData.website : mockRestaurantData.website}
                />

                <View style={styles.infoField}>
                    <Text style={styles.fieldLabel}>{t('profile.social_networks')}</Text>
                </View>
                <SocialNetworks networks={isProducer ? mockProducerData.socialNetworks : mockRestaurantData.socialNetworks} />
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
        width: 76,
        height: 76,
        marginBottom: 24,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f7f6ed',
        paddingTop: 40
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 16
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        lineHeight: 27,
        color: '#4A4459',
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#89a083',
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
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
        marginBottom: 16,
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
        fontWeight: '700',
    },
    infoField: {
        gap: 4,
    },
    infoFieldWithIcon: {
        gap: 4,
    },
    fieldWithIconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fieldIcon: {
        marginRight: 0,
    },
    fieldLabel: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#4a4459d1',
        lineHeight: 19.5,
        fontWeight: '400',
    },
    fieldValue: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459d1',
        lineHeight: 22.75,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: -30,
    },
    tag: {
        backgroundColor: '#89a083',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#fffef4',
        lineHeight: 18,
    },
    socialContainer: {
        gap: 8,
        marginTop: 8,
    },
    socialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    socialText: {
        fontSize: 14,
        color: '#4a4459',
        lineHeight: 21,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        marginBottom: 72,
    },
    signOutButton: {
        backgroundColor: '#b55d62ff',
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    signOutButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#ffffff',
        lineHeight: 21,
        fontWeight: '500',
    },
});
