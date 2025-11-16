import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session'
import React, { createContext, ReactNode, useEffect, useMemo, useReducer } from 'react'
import { convertKeycloakAttributesToProfile, getMissingProfileFields, isUserProfileComplete } from '../utils/profileUtils'

interface UserInfo {
  username: string
  givenName: string
  familyName: string
  email: string
  roles: string[]
  sub?: string // Keycloak user ID
}

interface AuthState {
  isSignedIn: boolean
  accessToken: string | null
  idToken: string | null
  userInfo: UserInfo | null
}

interface AuthContextType {
  state: AuthState
  signIn: () => void
  signInWithCredentials: (tokens: any, userInfo: any) => void
  signUpWithCredentials: (email: string, password: string, role: string) => Promise<{success: boolean, error?: string, message?: string, userId?: string}>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  checkProfileCompletion: () => Promise<{isComplete: boolean, missingFields: string[]}>
  isLoading: boolean
}

interface AuthAction {
  type: 'SIGN_IN' | 'USER_INFO' | 'SIGN_OUT' | 'RESTORE_TOKEN' | 'SET_LOADING'
  payload?: any
}

const initialState: AuthState = {
  isSignedIn: false,
  accessToken: null,
  idToken: null,
  userInfo: null,
}

// AsyncStorage keys
const AUTH_TOKEN_KEY = '@auth_token'
const AUTH_ID_TOKEN_KEY = '@auth_id_token'
const AUTH_USER_INFO_KEY = '@auth_user_info'

const AuthContext = createContext<AuthContextType>({
  state: initialState,
  signIn: () => { },
  signInWithCredentials: () => { },
  signUpWithCredentials: async () => ({ success: false }),
  signOut: async () => { },
  hasRole: (role: string) => false,
  checkProfileCompletion: async () => ({ isComplete: false, missingFields: [] }),
  isLoading: true
})

// Helper function to get Keycloak admin token
  const getKeycloakAdminToken = async (): Promise<string | null> => {
    try {
      const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
      const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
      const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG;    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', 'admin-cli');
    formData.append('username', adminUsername);
    formData.append('password', adminPassword);

    const response = await fetch(
      `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`,
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
      const errorText = await response.text();
      console.error('Failed to get admin token:', response.status);
      console.error('Error response:', errorText);
      return null;
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
};const AuthProvider = ({ children }: { children: ReactNode }) => {
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG || '')
  const redirectUri = makeRedirectUri()
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || '',
      redirectUri: redirectUri,
      scopes: ['openid', 'profile'],
    },
    discovery
  )

  const [isLoading, setIsLoading] = React.useState(true)

  const [authState, dispatch] = useReducer((previousState: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
      case 'SIGN_IN':
        return {
          ...previousState,
          isSignedIn: true,
          accessToken: action.payload.access_token,
          idToken: action.payload.id_token,
        }
      case 'USER_INFO':
        return {
          ...previousState,
          userInfo: {
            username: action.payload.preferred_username,
            givenName: action.payload.given_name,
            familyName: action.payload.family_name,
            email: action.payload.email,
            roles: action.payload.roles || [],
            sub: action.payload.sub // Keycloak user ID
          },
        }
      case 'RESTORE_TOKEN':
        return {
          ...previousState,
          isSignedIn: true,
          accessToken: action.payload.accessToken,
          idToken: action.payload.idToken,
          userInfo: action.payload.userInfo,
        }
      case 'SIGN_OUT':
        return initialState
      default:
        return previousState
    }
  }, initialState)

  // Save authentication data to AsyncStorage
  const saveAuthData = async (accessToken: string, idToken: string, userInfo: UserInfo) => {
    try {
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, accessToken],
        [AUTH_ID_TOKEN_KEY, idToken],
        [AUTH_USER_INFO_KEY, JSON.stringify(userInfo)]
      ])
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  }

  // Clear authentication data from AsyncStorage
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_ID_TOKEN_KEY, AUTH_USER_INFO_KEY])
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  }

  // Restore authentication state on app startup
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const [[, accessToken], [, idToken], [, userInfoString]] = await AsyncStorage.multiGet([
          AUTH_TOKEN_KEY,
          AUTH_ID_TOKEN_KEY,
          AUTH_USER_INFO_KEY
        ])

        if (accessToken && idToken && userInfoString) {
          const userInfo = JSON.parse(userInfoString)
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { accessToken, idToken, userInfo }
          })
        }
      } catch (error) {
        console.error('Error restoring auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreAuthState()
  }, [])

  useEffect(() => {
    const getToken = async ({ code, codeVerifier, redirectUri }: { 
      code: string
      codeVerifier: string
      redirectUri: string 
    }) => {
      try {
        const formData: Record<string, string> = {
          grant_type: 'authorization_code',
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || '',
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        }
        const formBody: string[] = []
        for (const property in formData) {
          const encodedKey = encodeURIComponent(property)
          const encodedValue = encodeURIComponent(formData[property])
          formBody.push(encodedKey + '=' + encodedValue)
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.join('&'),
          }
        )
        if (response.ok) {
          const payload = await response.json()
          dispatch({ type: 'SIGN_IN', payload })
        }
      } catch (e) {
        console.warn(e)
      }
    }
    if (response?.type === 'success') {
      const { code } = response.params
      getToken({
        code,
        codeVerifier: request?.codeVerifier || '',
        redirectUri,
      })
    } else if (response?.type === 'error') {
      console.warn('Authentication error: ', response.error)
    }
  }, [response, request?.codeVerifier, redirectUri])

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const accessToken = authState.accessToken
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/protocol/openid-connect/userinfo`,
          {
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + accessToken,
              Accept: 'application/json',
            },
          }
        )
        if (response.ok) {
          const payload = await response.json()
          dispatch({ type: 'USER_INFO', payload })
        }
      } catch (e) {
        console.warn(e)
      }
    }
    if (authState.isSignedIn) {
      getUserInfo()
    }
  }, [authState.accessToken, authState.isSignedIn])

  // Save auth data when user info is complete
  useEffect(() => {
    if (authState.isSignedIn && authState.accessToken && authState.idToken && authState.userInfo) {
      saveAuthData(authState.accessToken, authState.idToken, authState.userInfo)
    }
  }, [authState.isSignedIn, authState.accessToken, authState.idToken, authState.userInfo])

  const authContext = useMemo(
    () => ({
      state: authState,
      signIn: () => { promptAsync() },
      signInWithCredentials: (tokens: any, userInfo: any) => {
        // First dispatch the tokens to sign in
        dispatch({ type: 'SIGN_IN', payload: tokens });
        // Then dispatch user info
        dispatch({ type: 'USER_INFO', payload: userInfo });
        // Save to storage immediately since we have both tokens and userInfo
        const processedUserInfo = {
          username: userInfo.preferred_username,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          email: userInfo.email,
          roles: userInfo.roles || [],
          sub: userInfo.sub
        };
        saveAuthData(tokens.access_token, tokens.id_token, processedUserInfo);
      },
      signUpWithCredentials: async (email: string, password: string, role: string) => {
        try {
          // Step 1: Get admin token
          const adminToken = await getKeycloakAdminToken();
          if (!adminToken) {
            throw new Error('Failed to get admin access to Keycloak');
          }

          // Step 2: Create user in Keycloak
          const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';
          const userData = {
            username: email,
            email: email,
            enabled: true,
            emailVerified: false,
            credentials: [{
              type: 'password',
              value: password,
              temporary: false
            }],
            attributes: {
              role: [role]
            }
          };

          const createUserResponse = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(userData),
            }
          );

          if (!createUserResponse.ok) {
            const errorText = await createUserResponse.text();
            console.error('User creation failed:', errorText);
            
            if (createUserResponse.status === 409) {
              throw new Error('An account with this email already exists');
            } else if (createUserResponse.status === 400) {
              throw new Error('Invalid registration data');
            } else {
              throw new Error(`Registration failed: ${createUserResponse.status}`);
            }
          }

          // Step 3: Get the created user ID from Location header or by searching
          const locationHeader = createUserResponse.headers.get('location');
          let userId = null;
          
          if (locationHeader) {
            userId = locationHeader.split('/').pop();
          } else {
            // Fallback: search for the user
            const searchResponse = await fetch(
              `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users?username=${encodeURIComponent(email)}`,
              {
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'Accept': 'application/json',
                }
              }
            );
            
            if (searchResponse.ok) {
              const users = await searchResponse.json();
              if (users.length > 0) {
                userId = users[0].id;
              }
            }
          }

          // Step 4: Assign role to user (if userId is available)
          if (userId) {
            try {
              // First, get the client's internal ID using its clientId
              const clientId = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || 'rn-expo-app';
              const clientsResponse = await fetch(
                `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/clients?clientId=${clientId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Accept': 'application/json',
                  }
                }
              );

              if (!clientsResponse.ok) {
                console.warn('Failed to get client information');
                throw new Error('Failed to get client information');
              }

              const clients = await clientsResponse.json();
              if (clients.length === 0) {
                console.warn(`Client ${clientId} not found`);
                throw new Error(`Client ${clientId} not found`);
              }

              const clientUUID = clients[0].id; // This is the internal UUID

              // Get available client roles for rn-expo-app
              const clientRolesResponse = await fetch(
                `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/clients/${clientUUID}/roles`,
                {
                  headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Accept': 'application/json',
                  }
                }
              );

              if (clientRolesResponse.ok) {
                const availableRoles = await clientRolesResponse.json();
                const targetRole = availableRoles.find((r: any) => r.name === role);
                
                if (targetRole) {
                  // Assign the client role to the user
                  const assignRoleResponse = await fetch(
                    `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}/role-mappings/clients/${clientUUID}`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify([targetRole])
                    }
                  );

                  if (assignRoleResponse.ok) {
                    // Role assigned successfully
                  } else {
                    const errorText = await assignRoleResponse.text();
                    console.warn(`Failed to assign client role ${role}:`, errorText);
                  }
                } else {
                  console.warn(`Client role ${role} not found for client ${clientId}`);
                  console.warn('Available roles:', availableRoles.map((r: any) => r.name));
                }
              } else {
                const errorText = await clientRolesResponse.text();
                console.warn('Failed to get client roles:', errorText);
              }
            } catch (roleError) {
              console.warn('Client role assignment failed:', roleError);
            }
          }

          // Step 5: Send verification email
          if (userId) {
            const emailResponse = await fetch(
              `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}/send-verify-email`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'Content-Type': 'application/json',
                }
              }
            );

            if (emailResponse.ok) {
              // Verification email sent successfully
            } else {
              console.warn('Failed to send verification email, but user was created');
            }
          }

          // Step 6: Create profile in Account Service
          if (userId) {
            try {
              if (role === 'Producer') {
                const { ensureProducerProfileExists } = await import('../services/account');
                const accountResult = await ensureProducerProfileExists(userId, {
                  // Informations de base - à compléter plus tard dans complete-profile
                });
                console.log('Producer profile created successfully, ID:', accountResult.id);
              } else if (role === 'Restaurant Owner') {
                const { ensureRestaurantProfileExists } = await import('../services/account');
                const accountResult = await ensureRestaurantProfileExists(userId, {
                  // Informations de base - à compléter plus tard dans complete-profile
                });
                console.log('Restaurant profile created successfully, ID:', accountResult.id);
              }
            } catch (accountError) {
              // Don't fail the registration if account service fails
              // The notification will be queued for retry
              console.warn('Failed to create account profile (will retry later):', accountError);
            }
          }

          return {
            success: true,
            userId: userId,
            message: 'Registration successful! Please check your email for verification.'
          };

        } catch (error) {
          console.error('Registration error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
          };
        }
      },
      signOut: async () => {
        try {
          const idToken = authState.idToken
          await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/protocol/openid-connect/logout?id_token_hint=${idToken}`
          )
          await clearAuthData()
          dispatch({ type: 'SIGN_OUT' })
        } catch (e) {
          console.warn(e)
        }
      },
      hasRole: (role: string) => authState.userInfo?.roles.indexOf(role) !== -1,
      checkProfileCompletion: async () => {
        try {
          if (!authState.userInfo?.sub) {
            return { isComplete: false, missingFields: ['User not authenticated'] };
          }

          const adminToken = await getKeycloakAdminToken();
          if (!adminToken) {
            console.warn('Could not get admin token to check profile');
            return { isComplete: false, missingFields: ['Unable to check profile'] };
          }

          const targetRealm = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || 'marche-conclu';
          const userId = authState.userInfo.sub;
          const userRole = authState.userInfo.roles?.[0] || 'Producer';

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG}/admin/realms/${targetRealm}/users/${userId}`,
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Accept': 'application/json',
              }
            }
          );

          if (response.ok) {
            const userData = await response.json();
            const attributes = userData.attributes || {};
            const profileData = convertKeycloakAttributesToProfile(attributes);
            
            const isComplete = isUserProfileComplete(profileData, userRole);
            const missingFields = getMissingProfileFields(profileData, userRole);
            
            return { isComplete, missingFields };
          } else {
            console.warn('Failed to load user profile data for completion check');
            return { isComplete: false, missingFields: ['Unable to check profile'] };
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
          return { isComplete: false, missingFields: ['Error checking profile'] };
        }
      },
      isLoading,
    }),
    [authState, promptAsync, isLoading]
  )

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
