import React, { createContext, useMemo, useReducer, useEffect, ReactNode } from 'react'
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session'

interface UserInfo {
  username: string
  givenName: string
  familyName: string
  email: string
  roles: string[]
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
}

interface AuthAction {
  type: 'SIGN_IN' | 'USER_INFO' | 'SIGN_OUT'
  payload?: any
}

const initialState: AuthState = {
  isSignedIn: false,
  accessToken: null,
  idToken: null,
  userInfo: null,
}

const AuthContext = createContext<AuthContextType>({
  state: initialState,
  signIn: () => { },
  signInWithCredentials: () => { },
  signUpWithCredentials: async () => ({ success: false }),
  signOut: async () => { },
  hasRole: (role: string) => false
})

// Helper function to get Keycloak admin token
const getKeycloakAdminToken = async (): Promise<string | null> => {
  try {
    const adminUsername = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_PASSWORD || 'admin';
    const adminRealm = process.env.EXPO_PUBLIC_KEYCLOAK_ADMIN_REALM || 'master';
    const baseUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL_REG;
    
    console.log('Getting admin token for Keycloak...');
    console.log('URL:', `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`);
    console.log('Username:', adminUsername);
    console.log('Realm:', adminRealm);

    const formData = new URLSearchParams();
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
    console.log('Admin token obtained successfully');
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
            roles: action.payload.roles || []
          },
        }
      case 'SIGN_OUT':
        return initialState
      default:
        return previousState
    }
  }, initialState)

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

  const authContext = useMemo(
    () => ({
      state: authState,
      signIn: () => { promptAsync() },
      signInWithCredentials: (tokens: any, userInfo: any) => {
        // First dispatch the tokens to sign in
        dispatch({ type: 'SIGN_IN', payload: tokens });
        // Then dispatch user info
        dispatch({ type: 'USER_INFO', payload: userInfo });
      },
      signUpWithCredentials: async (email: string, password: string, role: string) => {
        try {
          console.log('Starting direct Keycloak registration for:', email, 'as', role);
          
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

          console.log('User created successfully in Keycloak');

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
              console.log(`Assigning ${role} role to user...`);
              
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
              console.log(`Found client ${clientId} with UUID: ${clientUUID}`);

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
                console.log('Available client roles:', availableRoles.map((r: any) => r.name));
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
                    console.log(`Client role ${role} assigned successfully`);
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
            console.log('Sending verification email...');
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
              console.log('Verification email sent successfully');
            } else {
              console.warn('Failed to send verification email, but user was created');
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
          dispatch({ type: 'SIGN_OUT' })
        } catch (e) {
          console.warn(e)
        }
      },
      hasRole: (role: string) => authState.userInfo?.roles.indexOf(role) !== -1,
    }),
    [authState, promptAsync]
  )

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }