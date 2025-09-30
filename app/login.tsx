import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../components/AuthContext';
import Button from '../components/Button';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  
  const { login, isLoading } = useAuthContext();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.login.error_fill_fields'), t('auth.login.error_fill_fields'));
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.replace('/home_page');
    } else {
      Alert.alert(t('auth.login.error_login_failed'), t('auth.login.error_login_failed'));
    }
  };

  const handleSignupRedirect = () => {
    // Navigate back to home and trigger signup choice modal
    router.replace('/home_page?showSignup=true');
  };

  const handleBackPress = () => {
    router.replace('/home_page');
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginForm}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Image
                source={require('../assets/images/icons8-arrow-96.png')}
                style={styles.backButtonIcon}
              />
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
                />
              </View>
            </View>

            {/* Login Button */}
            <Button
              title={isLoading ? t('auth.login.loading') : t('auth.login.sign_in')}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
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
    paddingTop: 50
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
    backgroundColor: '#EAE9E1',
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