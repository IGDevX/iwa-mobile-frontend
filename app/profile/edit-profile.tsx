import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../components/AuthContext';
import BottomModal from '../../components/BottomModal';
import { addProducerProfession, getCompleteUserProfile, getProfessions, removeProducerProfession, updateProducerProfile, updateRestaurantProfile, type ProducerProfileRequest, type RestaurantProfileRequest } from '../../services/account';

export default function EditProfilePage() {
    const { t } = useTranslation();
    const { state } = useContext(AuthContext);
    const rotateValue = useRef(new Animated.Value(0)).current;
    
    // Determine user role
    const userRole = state.userInfo?.roles?.[0] || 'Producer';
    const isProducer = userRole === 'Producer';

    // Loading states
    const [loading, setLoading] = useState(true);
    const [savingRequired, setSavingRequired] = useState(false);
    const [savingOptional, setSavingOptional] = useState(false);

    // Account Service ID (needed for updates)
    const [accountServiceId, setAccountServiceId] = useState<string>('');

    // Required fields (Keycloak)
    const [requiredData, setRequiredData] = useState({
        displayName: '',
        responsibleName: '',
        address: '',
        phoneNumber: '',
    });

    // Optional fields (Account Service)
    const [optionalData, setOptionalData] = useState({
        biography: '',
        website: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        // Producer specific
        siret: '',
        organizationType: '',
        installationYear: 0,
        employeesCount: 0,
        // Restaurant specific
        serviceType: '',
        cuisineType: '',
        hygieneCertifications: '',
        awards: '',
        // selected profession ids (managed by account service)
        selectedProfessionIds: [] as number[],
    });

    // Local type for profession option
    interface ProfessionOption {
        id: number;
        code?: string;
        nameEn?: string;
        nameFr?: string;
    }

    const [availableProfessions, setAvailableProfessions] = useState<ProfessionOption[]>([]);
    const [professionsModalVisible, setProfessionsModalVisible] = useState(false);
    
    // Track original profession IDs to calculate diff for POST/DELETE operations
    const [originalProfessionIds, setOriginalProfessionIds] = useState<number[]>([]);

    // Load profile data on mount
    useEffect(() => {
        loadProfileData();
    }, [state.userInfo]);

    // (Professions are managed in Keycloak only; account-service professions support removed)

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

    // Helper function to get admin token
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

    // Load profile data
    const loadProfileData = async () => {
        try {
            if (!state.userInfo?.sub) {
                console.log('No user info available');
                setLoading(false);
                return;
            }

            const keycloakId = state.userInfo.sub;

            const completeProfile = await getCompleteUserProfile(keycloakId, getKeycloakAdminToken);

            // Set required data (Keycloak)
            setRequiredData({
                displayName: completeProfile.keycloak.displayName,
                responsibleName: completeProfile.keycloak.responsibleName,
                address: completeProfile.keycloak.address,
                phoneNumber: completeProfile.keycloak.phoneNumber,
            });

            // Set optional data (Account Service)
            const professionsIds = Array.isArray((completeProfile.accountService as any)?.professions)
                ? ((completeProfile.accountService as any).professions as any[]).map((p: any) => p.id)
                : [];
            
            setOptionalData({
                biography: completeProfile.accountService.biography || '',
                website: completeProfile.accountService.website || '',
                facebook: completeProfile.accountService.facebook || '',
                instagram: completeProfile.accountService.instagram || '',
                linkedin: completeProfile.accountService.linkedin || '',
                // professions are managed by Account Service; selectedProfessionIds will hold user's choices
                siret: completeProfile.accountService.siret || '',
                organizationType: completeProfile.accountService.organizationType || '',
                installationYear: completeProfile.accountService.installationYear || 0,
                employeesCount: completeProfile.accountService.employeesCount || 0,
                serviceType: completeProfile.accountService.serviceType || '',
                cuisineType: completeProfile.accountService.cuisineType || '',
                hygieneCertifications: completeProfile.accountService.hygieneCertifications || '',
                awards: completeProfile.accountService.awards || '',
                selectedProfessionIds: professionsIds,
            });
            
            // Store original profession IDs for comparison later
            setOriginalProfessionIds(professionsIds);

            // Fetch available professions options from Account Service (use service helper)
            try {
                const list = await getProfessions();
                setAvailableProfessions(Array.isArray(list) ? list : []);
            } catch (e) {
                console.warn('Error fetching professions list from account service:', e);
            }

            // Save Account Service ID for updates
            setAccountServiceId(completeProfile.accountService.id.toString());
        } catch (error) {
            console.error('Error loading profile:', error);
            // Show user-friendly error but don't prevent page from showing
            Alert.alert(
                t('common.error', 'Error'),
                'Failed to load profile data. Please check your connection and try again.',
                [
                    { 
                        text: 'OK', 
                        onPress: () => router.back() 
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    // Save required information (Keycloak only)
    const handleSaveRequiredInfo = async () => {
        setSavingRequired(true);
        try {
            if (!state.userInfo?.sub) {
                throw new Error('User not authenticated');
            }

            // Validate required fields
            if (!requiredData.displayName || !requiredData.responsibleName || !requiredData.address || !requiredData.phoneNumber) {
                Alert.alert(
                    t('common.error', 'Error'),
                    t('profile.complete.validation.fill_all_fields', 'Please fill in all required fields')
                );
                return;
            }

            // profession no longer required here (managed by Account Service)

            const keycloakId = state.userInfo.sub;

            // Update Keycloak attributes directly
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
            if (getCurrentUserResponse.ok) {
                const currentUserData = await getCurrentUserResponse.json();
                existingAttributes = currentUserData.attributes || {};
            }

            // Prepare updated attributes
            const updatedAttributes: Record<string, string[]> = {
                ...existingAttributes,
                displayName: [requiredData.displayName],
                responsibleName: [requiredData.responsibleName],
                phoneNumber: [requiredData.phoneNumber],
                address: [requiredData.address],
            };

            // do not write profession attribute from required section; it's handled in optional account service flow

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

            Alert.alert(
                t('common.success', 'Success'),
                t('profile.update.success_required', 'Required information updated successfully')
            );
        } catch (error) {
            console.error('Error saving required info:', error);
            Alert.alert(
                t('common.error', 'Error'),
                t('profile.update.error', 'Failed to update required information')
            );
        } finally {
            setSavingRequired(false);
        }
    };

    // Update optional information (Account Service)
    const handleUpdate = async () => {
        setSavingOptional(true);
        try {
            if (!state.userInfo?.sub) {
                throw new Error('User not authenticated');
            }

            const keycloakId = state.userInfo.sub;

            // Prepare Account Service data based on role (professions NOT included here)
            let accountServiceData: any;

            if (isProducer) {
                accountServiceData = {
                    biography: optionalData.biography,
                    website: optionalData.website,
                    facebook: optionalData.facebook,
                    instagram: optionalData.instagram,
                    linkedin: optionalData.linkedin,
                    siret: optionalData.siret,
                    organizationType: optionalData.organizationType,
                    installationYear: optionalData.installationYear || undefined,
                    employeesCount: optionalData.employeesCount || undefined,
                    // NOTE: professionIds are managed via separate POST/DELETE endpoints
                };
            } else {
                accountServiceData = {
                    biography: optionalData.biography,
                    website: optionalData.website,
                    facebook: optionalData.facebook,
                    instagram: optionalData.instagram,
                    linkedin: optionalData.linkedin,
                    serviceType: optionalData.serviceType,
                    cuisineType: optionalData.cuisineType,
                    hygieneCertifications: optionalData.hygieneCertifications,
                    awards: optionalData.awards,
                };
            }

            // Update Account Service data using X-Keycloak-Id header
            console.log('Updating Account Service with Keycloak ID:', keycloakId);
            
            if (isProducer) {
                await updateProducerProfile(keycloakId, accountServiceData as ProducerProfileRequest);
                
                // Handle profession changes using POST/DELETE endpoints
                // IMPORTANT: Only process profession changes if we have valid data
                // Ensure arrays are defined to avoid undefined comparison issues
                const currentProfessionIds = optionalData.selectedProfessionIds || [];
                const originalIds = originalProfessionIds || [];
                
                console.log('🔍 BEFORE DIFF CALCULATION:');
                console.log('  - optionalData.selectedProfessionIds:', optionalData.selectedProfessionIds);
                console.log('  - originalProfessionIds state:', originalProfessionIds);
                console.log('  - currentProfessionIds (normalized):', currentProfessionIds);
                console.log('  - originalIds (normalized):', originalIds);
                
                // Calculate differences: what to add and what to remove
                const professionsToAdd = currentProfessionIds.filter(id => !originalIds.includes(id));
                const professionsToRemove = originalIds.filter(id => !currentProfessionIds.includes(id));
                
                console.log('=== Profession Management Debug ===');
                console.log('Original profession IDs:', originalIds);
                console.log('Current selected IDs:', currentProfessionIds);
                console.log('Professions to ADD:', professionsToAdd);
                console.log('Professions to REMOVE:', professionsToRemove);
                console.log('==================================');
                
                // Only process if there are actual changes
                if (professionsToAdd.length === 0 && professionsToRemove.length === 0) {
                    console.log('No profession changes detected, skipping profession update.');
                } else {
                    // Add new professions
                    for (const professionId of professionsToAdd) {
                        try {
                            console.log(`✅ Adding profession ${professionId}...`);
                            await addProducerProfession(keycloakId, professionId);
                            console.log(`✅ Successfully added profession ${professionId}`);
                        } catch (error) {
                            console.error(`❌ Failed to add profession ${professionId}:`, error);
                            throw new Error(`Failed to add profession ${professionId}`);
                        }
                    }
                    
                    // Remove deselected professions
                    for (const professionId of professionsToRemove) {
                        try {
                            console.log(`🗑️ Removing profession ${professionId}...`);
                            await removeProducerProfession(keycloakId, professionId);
                            console.log(`✅ Successfully removed profession ${professionId}`);
                        } catch (error) {
                            console.error(`❌ Failed to remove profession ${professionId}:`, error);
                            throw new Error(`Failed to remove profession ${professionId}`);
                        }
                    }
                }
                
                // Update original profession IDs after successful save
                setOriginalProfessionIds(currentProfessionIds);
                console.log('✅ Updated originalProfessionIds state to:', currentProfessionIds);
                
                // Reload profile data to ensure we have the latest from backend
                console.log('🔄 Reloading profile data from backend to verify professions...');
                await loadProfileData();
                console.log('✅ Profile data reloaded successfully');
            } else {
                await updateRestaurantProfile(keycloakId, accountServiceData as RestaurantProfileRequest);
            }

            Alert.alert(
                t('common.success', 'Success'),
                t('profile.update.success_optional', 'Optional information updated successfully'),
                [
                    {
                        text: t('common.ok', 'OK'),
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert(
                t('common.error', 'Error'),
                t('profile.update.error', 'Failed to update optional information')
            );
        } finally {
            setSavingOptional(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    const updateRequiredField = (field: keyof typeof requiredData, value: string) => {
        setRequiredData(prev => ({ ...prev, [field]: value }));
    };

    const updateOptionalField = (field: keyof typeof optionalData, value: string | number) => {
        setOptionalData(prev => ({ ...prev, [field]: value }));
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
                <Text style={styles.loadingText}>{t('profile.loading', 'Loading profile...')}</Text>
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
                    <Text style={styles.title}>
                        {isProducer 
                            ? t('edit_profile.title_producer', 'Modifier mon profil Producteur')
                            : t('edit_profile.title_restaurant', 'Modifier mon profil Restaurant')
                        }
                    </Text>
                </View>
            </View>

            {/* Required Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('edit_profile.required_info', 'Informations obligatoires')}
                </Text>
                <View style={styles.sectionContent}>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.display_name', 'Nom d\'affichage')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={requiredData.displayName}
                                onChangeText={(value) => updateRequiredField('displayName', value)}
                            />
                        </View>
                    </View>
                    
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.responsible_name', 'Nom du responsable')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={requiredData.responsibleName}
                                onChangeText={(value) => updateRequiredField('responsibleName', value)}
                            />
                        </View>
                    </View>

                    {/* Profession text input moved to optional section; account service manages professions */}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.address', 'Adresse')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={requiredData.address}
                                onChangeText={(value) => updateRequiredField('address', value)}
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.phone_number', 'Numéro de téléphone')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={requiredData.phoneNumber}
                                onChangeText={(value) => updateRequiredField('phoneNumber', value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* Save Required Info Button */}
                <TouchableOpacity
                    style={[styles.saveRequiredButton, savingRequired && styles.disabledButton]}
                    onPress={handleSaveRequiredInfo}
                    disabled={savingRequired}
                >
                    <Text style={styles.saveRequiredButtonText}>
                        {savingRequired 
                            ? t('edit_profile.saving', 'Enregistrement...') 
                            : t('edit_profile.save_required', 'Enregistrer les informations obligatoires')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Optional Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('edit_profile.optional_info', 'Informations facultatives')}
                </Text>
                <View style={styles.sectionContent}>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.biography', 'Biographie')}
                        </Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                value={optionalData.biography}
                                onChangeText={(value) => updateOptionalField('biography', value)}
                                multiline
                                placeholder={isProducer 
                                    ? t('edit_profile.placeholder_bio_producer', 'Présentez votre exploitation et vos valeurs...')
                                    : t('edit_profile.placeholder_bio_restaurant', 'Présentez votre restaurant et votre philosophie culinaire...')
                                }
                            />
                        </View>
                    </View>

                    {isProducer ? (
                        <>
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>{t('profile.siret', 'SIRET')}</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.siret || ''}
                                        onChangeText={(value) => updateOptionalField('siret', value)}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    {t('profile.organization_type', 'Type d\'organisme')}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.organizationType || ''}
                                        onChangeText={(value) => updateOptionalField('organizationType', value)}
                                        placeholder={t('edit_profile.placeholder_org_type', 'Exploitation agricole...')}
                                    />
                                </View>

                                {/* Professions (managed by Account Service) */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>{t('profile.professions', 'Métier(s)')}</Text>
                                    <TouchableOpacity style={styles.inputContainer} onPress={() => setProfessionsModalVisible(true)}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {optionalData.selectedProfessionIds && optionalData.selectedProfessionIds.length > 0 ? (
                                                optionalData.selectedProfessionIds.map((id, i) => {
                                                    const p = availableProfessions.find(pp => pp.id === id) as any;
                                                    const name = p?.nameFr || p?.nameEn || `#${id}`;
                                                    return (
                                                        <View key={i} style={styles.tag}>
                                                            <Text style={styles.tagText}>{name}</Text>
                                                        </View>
                                                    );
                                                })
                                            ) : (
                                                <Text style={styles.textInput}>{t('edit_profile.select_professions', 'Sélectionner des métiers...')}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        
                        
                        </>
                    ) : (
                        <>
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    {t('profile.service_type', 'Type de service')}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.serviceType || ''}
                                        onChangeText={(value) => updateOptionalField('serviceType', value)}
                                        placeholder={t('edit_profile.placeholder_service_type', 'Restaurant, Traiteur...')}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    {t('profile.cuisine_type', 'Type de cuisine')}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.cuisineType || ''}
                                        onChangeText={(value) => updateOptionalField('cuisineType', value)}
                                        placeholder={t('edit_profile.placeholder_cuisine_type', 'Ex: Italien, Végétarien, Gastronomique...')}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    {t('profile.hygiene_certifications', 'Certifications hygiène')}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.hygieneCertifications || ''}
                                        onChangeText={(value) => updateOptionalField('hygieneCertifications', value)}
                                        placeholder={t('edit_profile.placeholder_hygiene', 'HACCP, ISO 22000...')}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    {t('profile.awards', 'Récompenses')}
                                </Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={optionalData.awards || ''}
                                        onChangeText={(value) => updateOptionalField('awards', value)}
                                        placeholder={t('edit_profile.placeholder_awards', 'Étoiles Michelin, Guide Gault & Millau...')}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.installation_year', 'Année d\'installation')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={optionalData.installationYear?.toString() || ''}
                                onChangeText={(value) => updateOptionalField('installationYear', value ? parseInt(value) : 0)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.employees_count', 'Nombre d\'employés')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={optionalData.employeesCount?.toString() || ''}
                                onChangeText={(value) => updateOptionalField('employeesCount', value ? parseInt(value) : 0)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.website', 'Site web')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={optionalData.website || ''}
                                onChangeText={(value) => updateOptionalField('website', value)}
                                placeholder="https://www.monsite.fr"
                                keyboardType="url"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.social_networks', 'Réseaux sociaux')}
                        </Text>
                        <View style={styles.socialInputs}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={optionalData.facebook || ''}
                                    onChangeText={(value) => updateOptionalField('facebook', value)}
                                    placeholder="Facebook"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={optionalData.instagram || ''}
                                    onChangeText={(value) => updateOptionalField('instagram', value)}
                                    placeholder="Instagram"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={optionalData.linkedin || ''}
                                    onChangeText={(value) => updateOptionalField('linkedin', value)}
                                    placeholder="LinkedIn"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            {/* Professions selection modal */}
            <BottomModal
                visible={professionsModalVisible}
                onClose={() => setProfessionsModalVisible(false)}
                title={t('edit_profile.choose_professions', 'Choisir les métiers')}
                maxHeight="70%"
                contentStyle={{ backgroundColor: '#FFFEF4' }}
            >
                <View style={styles.professionsModalContent}>
                    {availableProfessions.map((p) => {
                        const selected = optionalData.selectedProfessionIds?.includes(p.id);
                        return (
                            <TouchableOpacity 
                                key={p.id} 
                                onPress={() => {
                                    // toggle selection
                                    setOptionalData(prev => {
                                        const prevIds: number[] = prev.selectedProfessionIds || [];
                                        const exists = prevIds.includes(p.id);
                                        const next = exists ? prevIds.filter(x => x !== p.id) : [...prevIds, p.id];
                                        return { ...prev, selectedProfessionIds: next };
                                    });
                                }} 
                                style={styles.professionItem}
                            >
                                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                                    {selected && <Ionicons name="checkmark" size={14} color="#fffef4" />}
                                </View>
                                <Text style={styles.professionLabel}>{p.nameFr || p.nameEn}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setProfessionsModalVisible(false)} style={styles.modalCancelButton}>
                        <Text style={styles.modalCancelText}>{t('common.cancel', 'Annuler')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setProfessionsModalVisible(false)} style={styles.modalDoneButton}>
                        <Text style={styles.modalDoneText}>{t('common.done', 'Terminé')}</Text>
                    </TouchableOpacity>
                </View>
            </BottomModal>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.updateButton, savingOptional && styles.disabledButton]} 
                    onPress={handleUpdate}
                    disabled={savingOptional}
                >
                    <Text style={styles.updateButtonText}>
                        {savingOptional 
                            ? t('edit_profile.saving', 'Enregistrement...') 
                            : t('edit_profile.update', 'Mettre à jour les informations facultatives')}
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
        paddingTop: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
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
        flex: 1,
    },
    section: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 24,
        fontWeight: '700',
        marginBottom: 16
    },
    sectionContent: {
        backgroundColor: '#eae9e1',
        borderRadius: 15,
        padding: 20,
        gap: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    fieldContainer: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 21,
        fontWeight: '400',
    },
    inputContainer: {
        height: 50,
        backgroundColor: '#f7f6ed',
        borderRadius: 15,
        paddingHorizontal: 16,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
    },
    textInput: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 21,
        flex: 1,
    },
    textAreaContainer: {
        height: 110,
        backgroundColor: '#f7f6ed',
        borderRadius: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
    },
    textArea: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 21,
        flex: 1,
        textAlignVertical: 'top',
    },
    passwordButton: {
        height: 50,
        backgroundColor: '#f7f6ed',
        borderRadius: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
    },
    passwordButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 21,
    },
    arrow: {
        fontSize: 16,
        color: '#89a083',
        fontFamily: 'Inter',
    },
    socialInputs: {
        gap: 12,
    },
    tag: {
        backgroundColor: '#89a083',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#fffef4',
        lineHeight: 18,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        marginBottom: 72,
    },
    updateButton: {
        height: 55,
        backgroundColor: '#89a083',
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
    updateButtonText: {
        fontSize: 18,
        fontFamily: 'Roboto',
        color: '#fffef4',
        lineHeight: 27,
        fontWeight: '500',
    },
    cancelButton: {
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 21,
        textDecorationLine: 'underline',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#4a4459',
        marginTop: 12,
    },
    saveRequiredButton: {
        height: 50,
        backgroundColor: '#6b8e65',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    saveRequiredButtonText: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#fffef4',
        lineHeight: 24,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.5,
    },
    professionsModalContent: {
        gap: 16,
        paddingVertical: 8,
    },
    professionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#4a4459',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#89a083',
        borderColor: '#89a083',
    },
    professionLabel: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 24,
        flex: 1,
    },
    modalActions: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#4a445933',
    },
    modalCancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    modalCancelText: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#4a4459',
        lineHeight: 24,
    },
    modalDoneButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#89a083',
        borderRadius: 12,
    },
    modalDoneText: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#fffef4',
        lineHeight: 24,
        fontWeight: '600',
    },
});