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
import { useAuthContext } from '../components/AuthContext';
import Button from '../components/Button';
import { router } from 'expo-router';

export default function RestaurantSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  const { register, isLoading } = useAuthContext();

  const handleSignup = async () => {
    if (!email || !password || !restaurantName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await register(email, password, restaurantName);

    if (success) {
      router.replace('/home_page');
    } else {
      Alert.alert('Error', 'Registration failed');
    }
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
                source={require('../assets/images/icons8-arrow-96.png')}
                style={styles.backButtonIcon}
              />
            </TouchableOpacity>
            <View style={styles.heading}>
              <Text style={styles.title}>Inscription Restaurant</Text>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.label}>
                <Text style={styles.labelText}>Email</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre.email@exemple.com"
                  placeholderTextColor="rgba(74, 68, 89, 0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.label}>
                <Text style={styles.labelText}>Mot de passe</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(74, 68, 89, 0.5)"
                  secureTextEntry
                />
              </View>
            </View>

            {/* Signup Button */}
            <Button
              title={isLoading ? 'En cours...' : "S'inscrire"}
              onPress={handleSignup}
              disabled={isLoading}
              style={styles.signupButton}
              textStyle={styles.signupButtonText}
              variant="secondary"
            />
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Button */}
            <Button
              title="Vous avez déjà un compte ?"
              onPress={handleLoginPress}
              variant="accent"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
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