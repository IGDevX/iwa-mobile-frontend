import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Image,
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import Button from './Button';
import { AuthContext } from '../components/AuthContext';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate responsive sizes
const isSmallDevice = SCREEN_WIDTH < 375;
const MODAL_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 380);
const ICON_SIZE = isSmallDevice ? 60 : 70;
const BUTTON_PADDING = isSmallDevice ? 12 : 18;

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
        router.push('/producer/profile/producer-signup');
    };

    const handleRestaurantPress = () => {
        onClose();
        router.push('/restaurant/profile/restaurant-signup');
    };

    const handleLoginPress = () => {
        onClose();
        router.push('../../profile/login');
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
            statusBarTranslucent={true}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                            {/* Main Buttons */}
                                            <View style={styles.buttonsContainer}>
                                                <Text style={styles.modalTitle}>{t("auth.signup_choice.join_us")}</Text>
                                                <View style={styles.rowContainer1}>
                                                    <Image
                                                        source={require('../assets/images/icons8-farmer-96.png')}
                                                        style={styles.logo}
                                                        resizeMode="contain"
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
                                                        resizeMode="contain"
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
                                                onPress={handleLoginPress}
                                                style={styles.loginButton}
                                                textStyle={styles.loginButtonText}
                                                variant="primary"
                                            />

                                            {/* Decorative Images - Removed for better alignment */}
                                        </View>
                                    </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    modalContainer: {
        width: MODAL_WIDTH,
        maxWidth: 380,
    },
    modalContent: {
        backgroundColor: '#FFFEF4',
        borderRadius: 25,
        padding: isSmallDevice ? 20 : 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
        width: '100%',
    },
    modalTitle: {
        fontSize: isSmallDevice ? 16 : 18,
        lineHeight: isSmallDevice ? 24 : 27,
        color: '#4A4459',
        fontWeight: '600',
        marginBottom: isSmallDevice ? 25 : 30,
        textAlign: 'center',
        width: '100%',
    },
    rowContainer1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        gap: 10,
    },
    rowContainer2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
    logo: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: 12,
    },
    buttonsContainer: {
        width: '100%',
        marginBottom: isSmallDevice ? 20 : 25,
    },
    choiceButton1: {
        flex: 1,
        marginBottom: 0,
        paddingVertical: BUTTON_PADDING,
        paddingHorizontal: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 50,
    },
    choiceButton2: {
        flex: 1,
        marginBottom: 0,
        marginRight: 0,
        paddingVertical: BUTTON_PADDING,
        paddingHorizontal: isSmallDevice ? 12 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 50,
    },
    choiceButtonText1: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    choiceButtonText2: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: '#4A4459',
        textAlign: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: isSmallDevice ? 15 : 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: isSmallDevice ? 12 : 14,
        fontWeight: '600',
        color: '#6B6B6B',
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#f6f5e9ff',
        shadowOpacity: 0,
        elevation: 0,
        paddingVertical: isSmallDevice ? 12 : 14,
        minHeight: 50,
    },
    loginButtonText: {
        color: '#4A4459',
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});