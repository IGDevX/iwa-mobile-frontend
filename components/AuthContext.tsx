import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { useAuth, User } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  checkAuthState: () => Promise<void>;
  signInWithKeycloak: () => void;
  keycloakRequest: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  
  // Keycloak configuration
  const keycloakUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
  const keycloakClientId = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID;
  
  const discovery = useAutoDiscovery(keycloakUrl || '');
  const redirectUri = makeRedirectUri();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: keycloakClientId || '',
      redirectUri: redirectUri,
      scopes: ['openid', 'profile'],
    },
    discovery
  );

  // Handle Keycloak authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      // Handle successful Keycloak authentication
      console.log('Keycloak auth success:', response);
      // TODO: Process the tokens and user info from Keycloak
      // You might want to call a function to exchange the code for tokens
      // and then update your auth state accordingly
    } else if (response?.type === 'error') {
      console.error('Keycloak auth error:', response.error);
    }
  }, [response]);

  const authContextValue = useMemo(
    () => ({
      ...auth,
      signInWithKeycloak: () => {
        if (keycloakUrl && keycloakClientId) {
          promptAsync();
        } else {
          console.error('Keycloak configuration missing. Please set EXPO_PUBLIC_KEYCLOAK_URL and EXPO_PUBLIC_KEYCLOAK_CLIENT_ID');
        }
      },
      keycloakRequest: request,
    }),
    [auth, promptAsync, request, keycloakUrl, keycloakClientId]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};