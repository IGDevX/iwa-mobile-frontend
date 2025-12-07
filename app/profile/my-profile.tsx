import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../components/AuthContext';
import { getCompleteUserProfile } from '../../services/account';

interface ProfileData {
    displayName: string;
    responsibleName: string;
    phoneNumber: string;
    address: string;
    email: string;
}

interface AccountServiceData {
    biography?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    // Producer specific
    professions?: Array<{
        id: number;
        code?: string;
        nameEn?: string;
        nameFr?: string;
    }>;
    siret?: string;
    organizationType?: string;
    installationYear?: number;
    employeesCount?: number;
    // Restaurant specific
    serviceType?: string;
    cuisineType?: string;
    hygieneCertifications?: string;
    awards?: string;
}

// Social networks type
interface SocialNetworks {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const { state, signOut } = useContext(AuthContext);
    const [profileData, setProfileData] = useState<ProfileData>({
        displayName: '',
        responsibleName: '',
        phoneNumber: '',
        address: '',
        email: '',
    });
    const [accountServiceData, setAccountServiceData] = useState<AccountServiceData>({});
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
    const SocialNetworks = ({ networks }: { networks: SocialNetworks }) => (
        <View style={styles.socialContainer}>
            {networks.facebook && (
                <View style={styles.socialItem}>
                    <Ionicons name="logo-facebook" size={16} color="#4A4459" />
                    <Text style={styles.socialText}>{networks.facebook}</Text>
                </View>
            )}
            {networks.instagram && (
                <View style={styles.socialItem}>
                    <Ionicons name="logo-instagram" size={16} color="#4A4459" />
                    <Text style={styles.socialText}>{networks.instagram}</Text>
                </View>
            )}
            {networks.linkedin && (
                <View style={styles.socialItem}>
                    <Ionicons name="logo-twitter" size={16} color="#4A4459" />
                    <Text style={styles.socialText}>{networks.linkedin}</Text>
                </View>
            )}
        </View>
    );

    // Load profile data when component mounts
    useEffect(() => {
        loadProfileData();
    }, [state.userInfo]);

    // Reload profile data when screen comes into focus (e.g., after editing)
    useFocusEffect(
        useCallback(() => {
            loadProfileData();
        }, [state.userInfo])
    );

    // Prefer professions coming from Account Service (array of objects). If none, show mock data for producers.
    const professionsToShow = (accountServiceData?.professions && accountServiceData.professions.length > 0)
        ? accountServiceData.professions.map(p => p.nameFr || p.nameEn || p.code || String(p.id))
        : [];

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

    // Function to load profile data from Keycloak + Account Service
    const loadProfileData = async () => {
        try {
            if (!state.userInfo?.sub) {
                setLoading(false);
                return;
            }

            const keycloakId = state.userInfo.sub;

            // Use the combined function to get both Keycloak and Account Service data
            const completeProfile = await getCompleteUserProfile(keycloakId, getKeycloakAdminToken);

            // Set Keycloak data (general information)
            setProfileData({
                displayName: completeProfile.keycloak.displayName || '',
                responsibleName: completeProfile.keycloak.responsibleName || '',
                phoneNumber: completeProfile.keycloak.phoneNumber || '',
                address: completeProfile.keycloak.address || '',
                email: completeProfile.keycloak.email || '',
            });

            // Set Account Service data (business-specific information)
            setAccountServiceData(completeProfile.accountService);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert(
                t('common.error', 'Error'),
                t('profile.error.load_failed', 'Failed to load profile data')
            );
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
            const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_BASE_URL;

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
        router.push('/profile/edit-profile');
    };

    const handleBack = () => {
        router.back();
    };

    const handleSettingsPress = () => {
        router.push('../settings');
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
                    source={require('../../assets/images/icons8-loading-96.png')}
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
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
                            <Image
                                source={require('../../assets/images/icons8-settings-96.png')}
                                style={styles.settingsIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                            <Image
                                source={require('../../assets/images/icons8-log-out-96.png')}
                                style={styles.logoutIcon}
                            />
                        </TouchableOpacity>
                    </View>
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
                        {accountServiceData.biography || t('profile.not_provided', 'Non renseigné')}
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

                        {accountServiceData.siret && (
                            <View style={styles.infoField}>
                                <Text style={styles.fieldLabel}>{t('profile.siret')}</Text>
                                <Text style={styles.fieldValue}>{accountServiceData.siret}</Text>
                            </View>
                        )}

                        {accountServiceData.organizationType && (
                            <View style={styles.infoField}>
                                <Text style={styles.fieldLabel}>{t('profile.organization_type')}</Text>
                                <Text style={styles.fieldValue}>{accountServiceData.organizationType}</Text>
                            </View>
                        )}

                        {/* Professions */}
                        {professionsToShow.length > 0 && (
                            <>
                                <FieldWithIcon
                                    icon="briefcase-outline"
                                    label={t('profile.professions', 'Métier(s)')}
                                    value=""
                                />
                                <TagsList tags={professionsToShow} />
                            </>
                        )}

                        {accountServiceData.installationYear && (
                            <FieldWithIcon
                                icon="calendar-outline"
                                label={t('profile.installation_year')}
                                value={accountServiceData.installationYear.toString()}
                            />
                        )}

                        {accountServiceData.employeesCount && (
                            <FieldWithIcon
                                icon="people-outline"
                                label={t('profile.employees_count')}
                                value={accountServiceData.employeesCount.toString()}
                            />
                        )}
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

                        {accountServiceData.serviceType && (
                            <FieldWithIcon
                                icon="restaurant-outline"
                                label={t('profile.service_type')}
                                value={accountServiceData.serviceType}
                            />
                        )}

                        {accountServiceData.cuisineType && (
                            <View style={styles.infoField}>
                                <Text style={styles.fieldLabel}>{t('profile.cuisine_type')}</Text>
                                <Text style={styles.fieldValue}>{accountServiceData.cuisineType}</Text>
                            </View>
                        )}

                        {accountServiceData.installationYear && (
                            <FieldWithIcon
                                icon="calendar-outline"
                                label={t('profile.installation_year')}
                                value={accountServiceData.installationYear.toString()}
                            />
                        )}

                        {accountServiceData.employeesCount && (
                            <FieldWithIcon
                                icon="people-outline"
                                label={t('profile.employees_count')}
                                value={accountServiceData.employeesCount.toString()}
                            />
                        )}
                    </View>

                    {/* Certifications and Awards - Restaurant */}
                    {(accountServiceData.hygieneCertifications || accountServiceData.awards) && (
                        <View style={styles.infoSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {t('profile.certifications')}
                                </Text>
                            </View>

                            {accountServiceData.hygieneCertifications && (
                                <>
                                    <FieldWithIcon
                                        icon="shield-checkmark-outline"
                                        label={t('profile.hygiene_certifications')}
                                        value=""
                                    />
                                    <TagsList tags={accountServiceData.hygieneCertifications.split(', ')} />
                                </>
                            )}

                            {accountServiceData.awards && (
                                <>
                                    <FieldWithIcon
                                        icon="trophy-outline"
                                        label={t('profile.awards')}
                                        value=""
                                    />
                                    <TagsList tags={accountServiceData.awards.split(', ')} />
                                </>
                            )}
                        </View>
                    )}
                </>
            )}

            {/* Online Presence Section */}
            <View style={{...styles.infoSection, marginBottom: 70}}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('profile.online_presence')}
                    </Text>
                </View>

                {accountServiceData.website && (
                    <FieldWithIcon
                        icon="globe-outline"
                        label={t('profile.website')}
                        value={accountServiceData.website}
                    />
                )}

                {(accountServiceData.facebook || accountServiceData.instagram || accountServiceData.linkedin) && (
                    <>
                        <View style={styles.infoField}>
                            <Text style={styles.fieldLabel}>{t('profile.social_networks')}</Text>
                        </View>
                        <SocialNetworks networks={{
                            facebook: accountServiceData.facebook,
                            instagram: accountServiceData.instagram,
                            linkedin: accountServiceData.linkedin,
                        }} />
                    </>
                )}
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
        paddingTop: 40,
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
        justifyContent: 'space-between',
        gap: 12,
    },
    headerIcons: {
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
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    settingsIcon: {
        width: 30,
        height: 30,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    logoutIcon: {
        width: 30,
        height: 30,
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
});
