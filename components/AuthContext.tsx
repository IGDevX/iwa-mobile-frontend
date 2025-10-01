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
  signOut: async () => { },
  hasRole: (role: string) => false
})

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL || '')
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
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
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
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
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
      signOut: async () => {
        try {
          const idToken = authState.idToken
          await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}`
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