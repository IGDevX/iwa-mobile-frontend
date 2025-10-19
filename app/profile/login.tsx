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
import { AuthContext } from '../../components/AuthContext';
import Button from '../../components/Button';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  const { state, signInWithCredentials, checkProfileCompletion } = useContext(AuthContext);

  // Direct Keycloak login using username/password
  const handleKeycloakDirectLogin = async (username: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('client_id', process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || '');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', 'openid profile email');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
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
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Authentication failed');
      }

      const tokenData = await response.json();
      
      // Get user info using the access token
      const userInfoResponse = await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const userInfo = await userInfoResponse.json();
      
      return {
        success: true,
        tokens: tokenData,
        userInfo: userInfo
      };
    } catch (error) {
      console.error('Direct Keycloak login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const handleLogin = async () => {
    // Dismiss keyboard and remove focus from text inputs
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert(t('auth.login.error_fill_fields'), t('auth.login.error_fill_fields'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await handleKeycloakDirectLogin(email, password);

      if (result.success) {
        // Update AuthContext state with the authentication data
        signInWithCredentials(result.tokens, result.userInfo);
      } else {
        Alert.alert(
          t('auth.login.error_login_failed'),
          result.error || 'Please check your credentials and try again.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        t('auth.login.error_login_failed'),
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated and redirect
  React.useEffect(() => {
    if (state.isSignedIn) {
      // Check profile completion and redirect accordingly
      checkProfileAndRedirect();
    }
  }, [state.isSignedIn]);

  const checkProfileAndRedirect = async () => {
    try {
      const profileStatus = await checkProfileCompletion();
      
      if (profileStatus.isComplete) {
        // Profile is complete, redirect based on user role
        const userRole = state.userInfo?.roles?.[0];
        if (userRole === 'Producer') {
          router.replace('../producer/home/producer-shop');
        } else {
          router.replace('../restaurant/home/restaurant-home');
        }
      } else {
        // Profile is incomplete, redirect to complete profile
        router.replace('/profile/complete-profile');
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // Default to complete profile page if there's an error
      router.replace('/profile/complete-profile');
    }
  };

  const handleSignupRedirect = () => {
    // Navigate back to home and trigger signup choice modal
    router.replace('../restaurant/home/restaurant-home?showSignup=true');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginForm}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={20} color="#4A4459" />
            </TouchableOpacity>
            <View style={styles.heading}>
              <Text style={styles.title}>{t('auth.login.title')}</Text>
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
                  editable={!isLoading}
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
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Login Button */}
            <Button
              title={isLoading ? t('auth.login.loading') : t('auth.login.sign_in')}
              onPress={handleLogin}
              disabled={isLoading}
              style={isLoading ? styles.disabledButton : styles.loginButton}
              textStyle={styles.loginButtonText}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF4',
    paddingTop: 40
  },
  loginForm: {
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
  loginButton: {
    marginTop: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 16,
    backgroundColor: '#89A083',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  loginButtonText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFEF4',
    fontWeight: '600',
  },
  disabledButton: {
    marginTop: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 16,
    backgroundColor: '#CCCCCC',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#f6f5e9ff',
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
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