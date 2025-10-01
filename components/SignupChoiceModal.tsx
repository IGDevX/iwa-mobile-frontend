import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Image,
    Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Button from './Button';
import { AuthContext } from '../components/AuthContext';

interface SignupChoiceModalProps {
    visible: boolean;
    onClose: () => void;
    onExistingUser: () => void;
}



export default function SignupChoiceModal({
    visible,
    onClose,
    onExistingUser
}: SignupChoiceModalProps) {
    const { t } = useTranslation();

    const handleProducerPress = () => {
        onClose();
        router.push('/producer-signup');
    };

    const handleRestaurantPress = () => {
        onClose();
        router.push('/restaurant-signup');
    };

    const { signIn, state } = useContext(AuthContext);

    // Handle Keycloak OAuth login
    const handleKeycloakLogin = async () => {
        try {
            // The signIn function from AuthContext triggers the Keycloak OAuth flow
            // This will:
            // 1. Open the Keycloak login page in a browser/webview
            // 2. User authenticates with their Keycloak credentials
            // 3. Keycloak redirects back to the app with authorization code
            // 4. AuthContext exchanges the code for access tokens
            // 5. User info is fetched and stored in the auth state
            signIn();
            onClose();
            // Note: The loading state will be reset by useEffect when authentication completes
        } catch (error) {
            console.error('Keycloak login error:', error);
            Alert.alert(
                t('auth.login.error_login_failed'),
                'Failed to authenticate with Keycloak. Please try again.',
                [
                    { text: 'OK', style: 'default' }
                ]
            );
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {/* Main Buttons */}
                                <View style={styles.buttonsContainer}>
                                    <View style={styles.rowContainer1}>
                                        <Image
                                            source={require('../assets/images/icons8-farmer-96.png')}
                                            style={styles.logo}
                                        />
                                        <Button
                                            title={t("auth.signup_choice.are_you_producer")}
                                            onPress={handleProducerPress}
                                            variant="secondary"
                                            style={styles.choiceButton1}
                                            textStyle={styles.choiceButtonText1}
                                        />
                                    </View>
                                    <View style={styles.rowContainer2}>
                                        <Button
                                            title={t("auth.signup_choice.are_you_restaurant")}
                                            onPress={handleRestaurantPress}
                                            variant="primary"
                                            style={styles.choiceButton2}
                                            textStyle={styles.choiceButtonText2}
                                        />
                                        <Image
                                            source={require('../assets/images/icons8-chef-96.png')}
                                            style={styles.logo}
                                        />
                                    </View>

                                </View>

                                {/* Divider */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>{t("auth.signup_choice.or")}</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Login Button */}
                                <Button
                                    title={t("auth.signup_choice.already_have_account")}
                                    onPress={handleKeycloakLogin}
                                    style={styles.loginButton}
                                    textStyle={styles.loginButtonText}
                                    variant="primary"
                                />

                                {/* Decorative Images */}
                                <View style={styles.decorativeContainer}>
                                    <Image
                                        source={{ uri: 'https://placehold.co/80x80' }}
                                        style={styles.decorativeImage1}
                                    />
                                    <Image
                                        source={{ uri: 'https://placehold.co/60x60' }}
                                        style={styles.decorativeImage2}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 380,
    },
    modalContent: {
        backgroundColor: '#FFFEF4',
        borderRadius: 25,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
        paddingTop: 60,
    },
    rowContainer1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    rowContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logoContainer: {
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    buttonsContainer: {
        width: '100%',
        marginBottom: 25,
    },
    choiceButton1: {
        marginBottom: 16,
        paddingVertical: 18,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    choiceButton2: {
        marginBottom: 16,
        marginRight: 10,
        paddingVertical: 18,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    choiceButtonText1: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF'
    },
    choiceButtonText2: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A4459',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 20,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B6B6B',
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#f6f5e9ff',
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#4A4459',
        fontSize: 16,
        fontWeight: '600',
    },
    decorativeContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
    decorativeImage1: {
        position: 'absolute',
        top: 20,
        right: -10,
        width: 40,
        height: 40,
        opacity: 0.3,
        borderRadius: 20,
    },
    decorativeImage2: {
        position: 'absolute',
        bottom: 20,
        left: -10,
        width: 35,
        height: 35,
        opacity: 0.3,
        borderRadius: 17.5,
    },
});