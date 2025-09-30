import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuthContext } from '../components/AuthContext';
import { router } from 'expo-router';
import Button from '../components/Button';

export default function ProtectedScreen() {
  const { isAuthenticated, user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    router.replace('/home-page');
  };


  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>You need to be logged in to view this page</Text>
        <Button
          title="Go to Login"
          onPress={() => router.push('/login')}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Protected Page</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name || 'User'}!</Text>
      
      <View style={styles.buttonContainer}>
        
        <Button
          title="Logout"
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
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    marginBottom: 10,
  },
});