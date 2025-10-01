# Keycloak Authentication Implementation

## Overview
The login page now supports Keycloak OAuth authentication integration. The app is configured to authenticate users through a Keycloak server instance.

## Configuration
The Keycloak configuration is stored in environment variables:

```env
EXPO_PUBLIC_KEYCLOAK_URL=https://marche-conclu-keycloak.cluster-ig5.igpolytech.fr/realms/marche-conclu
EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=rn-expo-app
```

## How it works

### 1. Authentication Flow
1. User clicks "Login with Keycloak" button
2. App opens Keycloak login page in browser/webview
3. User enters their Keycloak credentials
4. Keycloak redirects back to app with authorization code
5. App exchanges code for access tokens
6. User information is fetched and stored
7. User is redirected to protected content

### 2. Implementation Details

#### AuthContext (`components/AuthContext.tsx`)
- Manages authentication state using React Context
- Handles OAuth flow with `expo-auth-session`
- Stores access tokens, ID tokens, and user info
- Provides `signIn()`, `signOut()`, and `hasRole()` methods

#### Login Page (`app/login.tsx`)
- Dual authentication options (Email/Password placeholder + Keycloak)
- Loading states and error handling
- Automatic redirect on successful authentication
- Internationalization support

### 3. Key Features
- **OAuth 2.0 Flow**: Secure authentication using industry standards
- **Token Management**: Automatic token storage and refresh
- **User Roles**: Support for role-based access control
- **Auto Logout**: Proper session cleanup on logout
- **Loading States**: User-friendly feedback during authentication
- **Error Handling**: Comprehensive error handling with user messages

### 4. Usage in Components
```tsx
import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';

function MyComponent() {
  const { state, signIn, signOut, hasRole } = useContext(AuthContext);
  
  if (state.isSignedIn) {
    return <div>Welcome {state.userInfo?.username}</div>;
  }
  
  return <button onClick={signIn}>Login</button>;
}
```

### 5. Protected Routes
The app automatically redirects authenticated users to `/protected-page` and shows signup prompts for unauthenticated users trying to access protected content.

## Testing
To test the Keycloak integration:
1. Ensure the Keycloak server is running and accessible
2. Run the Expo app: `npx expo start`
3. Navigate to the login page
4. Click "Login with Keycloak"
5. Enter valid Keycloak credentials
6. Verify successful authentication and redirect