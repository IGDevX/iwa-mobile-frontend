import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../components/AuthContext';
import Button from '../../../components/Button';
import EmailVerificationModal from '../../../components/EmailVerificationModal';
import { router } from 'expo-router';

export default function RestaurantSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { t } = useTranslation();
  
  const { signUpWithCredentials } = useContext(AuthContext);

  const handleSignup = async () => {
    // Dismiss keyboard and remove focus from text inputs
    Keyboard.dismiss();
    
    if (!email || !password ) {
      Alert.alert(t('auth.login.error_fill_fields'), t('auth.login.error_fill_fields'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithCredentials(email, password, 'Restaurant Owner');

      if (result.success) {
        setShowEmailVerification(true);
        // Show success message and redirect to login
        Alert.alert(
          t('auth.signup.success_title', 'Registration Successful!'),
          t('auth.signup.success_message', 'Please check your email for verification, then login with your credentials.'),
          [
            {
              text: t('auth.signup.go_to_login', 'Go to Login'),
              onPress: () => {
                setShowEmailVerification(false);
                router.replace('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('auth.signup.error_signup_failed', 'Signup Failed'),
          result.error || t('auth.signup.try_again_later', 'Please try again later.')
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        t('auth.signup.error_signup_failed', 'Signup Failed'),
        t('auth.signup.unexpected_error', 'An unexpected error occurred. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    // TODO: Implement resend functionality
    Alert.alert(
      t('auth.email_verification.resend_success', 'Email Sent'),
      t('auth.email_verification.resend_message', 'Verification email has been resent.')
    );
  };

  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false);
    // Navigate back to home or login
    router.replace('/restaurant/home/restaurant-home');
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleLoginPress = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.restaurantRegistration}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Image
                source={require('../../../assets/images/icons8-arrow-96.png')}
                style={styles.backButtonIcon}
              />
            </TouchableOpacity>
            <View style={styles.heading}>
              <Text style={styles.title}>{t('auth.login.restaurant_signup_title')}</Text>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.label}>
                <Text style={styles.labelText}>{t('auth.login.email')}</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('auth.login.email_placeholder')}
                  placeholderTextColor="rgba(74, 68, 89, 0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.label}>
                <Text style={styles.labelText}>{t('auth.login.password')}</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('auth.login.password_placeholder')}
                  placeholderTextColor="rgba(74, 68, 89, 0.5)"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Signup Button */}
            <Button
              title={isLoading ? t('auth.login.loading', 'Loading...') : t('auth.login.sign_up')}
              onPress={handleSignup}
              disabled={isLoading}
              style={styles.signupButton}
              textStyle={styles.signupButtonText}
              variant="secondary"
            />
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.signup_choice.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Button */}
            <Button
              title={t('auth.login.already_have_account')}
              onPress={handleLoginPress}
              variant="accent"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />
          </View>
        </View>
      </View>
      
      {/* Email Verification Modal */}
      <EmailVerificationModal
        visible={showEmailVerification}
        email={email}
        onResend={handleResendEmail}
        onClose={handleEmailVerificationClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF4',
    paddingTop: 50
  },
  restaurantRegistration: {
    flex: 1,
    backgroundColor: '#FFFEF4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 64,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    width: 20,
    height: 20
  },
  heading: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40, // Compensate for back button width to center title
  },
  title: {
    fontSize: 18,
    lineHeight: 27,
    color: '#4A4459',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4459',
    fontWeight: '500',
  },
  inputContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 15,
    backgroundColor: '#EAE9E1',
    height: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#4A4459',
    flex: 1,
  },
  signupButton: {
    marginTop: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 16,
    backgroundColor: '#E8DFDA',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  signupButtonText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#4A4459',
    fontWeight: '600',
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 15,
    lineHeight: 22.5,
    color: '#4A4459',
    textDecorationLine: 'underline',
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
  }
});