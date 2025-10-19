import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../components/AuthContext';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function EditProfilePage() {
    const { t } = useTranslation();
    const { state } = useContext(AuthContext);
    
    // Determine user role
    const userRole = state.userInfo?.roles?.[0] || 'Producer';
    const isProducer = userRole === 'Producer';

    const [formData, setFormData] = useState({
        displayName: isProducer ? 'Ferme Bio du Soleil' : 'Restaurant Le Gourmet',
        responsibleName: isProducer ? 'Jean Dupont' : 'Marie Martin',
        email: 'user@example.com',
        address: isProducer ? '123 Rue de la Ferme, 34000 Montpellier' : '123 Rue du Commerce, 34000 Montpellier',
        phoneNumber: isProducer ? '+33 6 12 34 56 78' : '+33 4 67 12 34 56',
        biography: '',
        website: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        // Producer specific
        siret: '12345678901234',
        organizationType: '',
        installationYear: '2020',
        employeesCount: '5',
        // Restaurant specific
        serviceType: '',
        cuisineType: '',
        hygieneCertifications: '',
        awards: '',
    });

    const handleBack = () => {
        router.back();
    };

    const handleUpdate = () => {
        // TODO: Implement update logic
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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

            {/* Account Information Section - Restaurant Only */}
            {!isProducer && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('edit_profile.account_info', 'Informations du compte')}
                    </Text>
                    <View style={styles.sectionContent}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>{t('auth.login.email', 'Email')}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.email}
                                    onChangeText={(value) => updateField('email', value)}
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {t('edit_profile.password', 'Mot de passe')}
                            </Text>
                            <TouchableOpacity style={styles.passwordButton}>
                                <Text style={styles.passwordButtonText}>
                                    {t('edit_profile.change_password', 'Modifier le mot de passe')}
                                </Text>
                                <Text style={styles.arrow}>→</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

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
                                value={formData.displayName}
                                onChangeText={(value) => updateField('displayName', value)}
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
                                value={formData.responsibleName}
                                onChangeText={(value) => updateField('responsibleName', value)}
                            />
                        </View>
                    </View>

                    {isProducer && (
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {t('profile.professions', 'Métier(s)')}
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('edit_profile.placeholder_professions', 'Maraîcher, Producteur...')}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {t('profile.complete.address', 'Adresse')}
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={formData.address}
                                onChangeText={(value) => updateField('address', value)}
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
                                value={formData.phoneNumber}
                                onChangeText={(value) => updateField('phoneNumber', value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>
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
                                value={formData.biography}
                                onChangeText={(value) => updateField('biography', value)}
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
                                        value={formData.siret}
                                        onChangeText={(value) => updateField('siret', value)}
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
                                        value={formData.organizationType}
                                        onChangeText={(value) => updateField('organizationType', value)}
                                        placeholder={t('edit_profile.placeholder_org_type', 'Exploitation agricole...')}
                                    />
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
                                        value={formData.serviceType}
                                        onChangeText={(value) => updateField('serviceType', value)}
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
                                        value={formData.cuisineType}
                                        onChangeText={(value) => updateField('cuisineType', value)}
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
                                        value={formData.hygieneCertifications}
                                        onChangeText={(value) => updateField('hygieneCertifications', value)}
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
                                        value={formData.awards}
                                        onChangeText={(value) => updateField('awards', value)}
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
                                value={formData.installationYear}
                                onChangeText={(value) => updateField('installationYear', value)}
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
                                value={formData.employeesCount}
                                onChangeText={(value) => updateField('employeesCount', value)}
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
                                value={formData.website}
                                onChangeText={(value) => updateField('website', value)}
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
                                    value={formData.facebook}
                                    onChangeText={(value) => updateField('facebook', value)}
                                    placeholder="Facebook"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.instagram}
                                    onChangeText={(value) => updateField('instagram', value)}
                                    placeholder="Instagram"
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.linkedin}
                                    onChangeText={(value) => updateField('linkedin', value)}
                                    placeholder="LinkedIn"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                    <Text style={styles.updateButtonText}>
                        {t('edit_profile.update', 'Mettre à jour')}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
});