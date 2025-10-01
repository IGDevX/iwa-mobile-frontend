import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import { AuthContext } from '../components/AuthContext';

export default function ProtectedScreen() {
  const { t } = useTranslation();
  const { signIn, signOut, state } = useContext(AuthContext);
  const isAuthenticated = state.isSignedIn;
  const user = state.userInfo;

  const handleLogout = async () => {
    await signOut();
    router.replace('/home-page');
  };

    const [isKeycloakLoading, setIsKeycloakLoading] = useState(false);
  
    // Handle Keycloak OAuth login
    const handleKeycloakLogin = async () => {
      try {
        setIsKeycloakLoading(true);
        // The signIn function from AuthContext triggers the Keycloak OAuth flow
        // This will:
        // 1. Open the Keycloak login page in a browser/webview
        // 2. User authenticates with their Keycloak credentials
        // 3. Keycloak redirects back to the app with authorization code
        // 4. AuthContext exchanges the code for access tokens
        // 5. User info is fetched and stored in the auth state
        signIn();
        // Note: The loading state will be reset by useEffect when authentication completes
      } catch (error) {
        console.error('Keycloak login error:', error);
        setIsKeycloakLoading(false);
        Alert.alert(
          t('auth.login.error_login_failed'),
          'Failed to authenticate with Keycloak. Please try again.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
    };


  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('protected.access_denied')}</Text>
        <Text style={styles.subtitle}>{t('protected.login_required')}</Text>
        <Button
          title={t('protected.go_to_login')}
          onPress={handleKeycloakLogin}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('protected.title')}</Text>
      <Text style={styles.subtitle}>
        {t('protected.welcome', { name: user?.username || user?.givenName || 'User' })}
      </Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.infoText}>{t('protected.user_info.email')}: {user.email}</Text>
          <Text style={styles.infoText}>{t('protected.user_info.full_name')}: {user.givenName} {user.familyName}</Text>
          {user.roles.length > 0 && (
            <Text style={styles.infoText}>{t('protected.user_info.roles')}: {user.roles.join(', ')}</Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        
        <Button
          title={t('protected.logout')}
          onPress={handleLogout}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4459',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#4A4459',
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    marginBottom: 10,
  },
});