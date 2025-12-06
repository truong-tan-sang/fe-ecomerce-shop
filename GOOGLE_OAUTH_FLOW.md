# Google Authentication Frontend Implementation Guide

## Overview
This document describes the Google OAuth 2.0 authentication flow that the backend implements. Follow these steps to integrate Google login/registration on the frontend.

---

## Prerequisites

1. **Google OAuth 2.0 Setup**
   - Create a Google Cloud Project
   - Enable Google OAuth 2.0 API
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `http://localhost:4000/auth/google/google-redirect`
   - Store your `GOOGLE_CLIENT_ID` for frontend use

2. **Install Dependencies**
   ```bash
   npm install @react-oauth/google
   # or
   yarn add @react-oauth/google
   ```

---

## Implementation Flow

### Step 1: Set Up Google OAuth Provider

Wrap your app with `GoogleOAuthProvider` at the top level:

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {/* Your routes and components */}
    </GoogleOAuthProvider>
  );
}
```

---

### Step 2: Create Google Login Button Component

Create a reusable Google login button component:

```typescript
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function GoogleLoginButton() {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      // Extract JWT token from Google response
      const token = credentialResponse.credential;

      // Decode JWT to get user info (optional, for immediate UI update)
      // const decoded = jwtDecode(token);
      // console.log('Google user:', decoded);

      // Call backend to validate and create/login user
      const response = await fetch(
        'http://localhost:4000/auth/google/google-redirect',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies if needed
        }
      );

      if (!response.ok) {
        throw new Error('Google authentication failed');
      }

      const data = await response.json();

      // Store JWT access token
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update app state with user info
      // dispatch(setUser(data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      // Show error message to user
    }
  };

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
    // Show error message to user
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLoginSuccess}
      onError={handleGoogleLoginError}
      theme="outline"
      size="large"
      text="signin_with"
    />
  );
}

export default GoogleLoginButton;
```

---

### Step 3: Alternative - Redirect Flow (For More Control)

If you prefer manual redirect instead of the component above:

```typescript
function LoginPage() {
  const handleGoogleLoginClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      'http://localhost:4000/auth/google/google-redirect'
    );
    const scope = encodeURIComponent('email profile');
    
    // Optional: Pass state data
    const state = encodeURIComponent(JSON.stringify({
      returnUrl: '/dashboard',
      timestamp: Date.now(),
    }));

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <button onClick={handleGoogleLoginClick}>
      Sign in with Google
    </button>
  );
}
```

---

### Step 4: Handle OAuth Callback

The backend automatically handles the Google OAuth callback at:
```
GET /auth/google/google-redirect
```

**Backend automatically:**
1. ✅ Validates Google OAuth token
2. ✅ Extracts user profile (email, firstName, lastName)
3. ✅ Checks if user exists in database
4. ✅ Creates new user if not exists (auto-verified)
5. ✅ Returns JWT access token + user data
6. ✅ Redirects to frontend (you configure the redirect URL)

**You need to:**
- Set backend's OAuth callback to redirect to your frontend with token/user data
- Parse the response and store credentials
- Redirect user to dashboard/home

---

### Step 5: Store and Use Authentication Token

```typescript
// Store after successful login
const storeAuthToken = (accessToken: string, user: any) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isAuthenticated', 'true');
};

// Retrieve for API calls
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Use in API calls
const fetchUserProfile = async () => {
  const token = getAuthToken();
  const response = await fetch('http://localhost:4000/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```

---

### Step 6: Add Bearer Token to All Requests

Create an API interceptor/utility:

```typescript
// api.ts
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(
    `http://localhost:4000${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response.json();
};

// Usage
const user = await apiCall('/auth/profile', { method: 'GET' });
```

---

## API Endpoints Reference

### Google Authentication Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth/google` | GET | Start Google OAuth flow | No |
| `/auth/google/google-redirect` | GET | OAuth callback (backend handles) | No |
| `/auth/profile` | GET | Get current user profile | Yes (Bearer) |

### Response Format (Success)

```json
{
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "USER",
    "isAdmin": false
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Implementation Checklist

- [ ] Install `@react-oauth/google` package
- [ ] Set up Google OAuth 2.0 credentials in Google Cloud Console
- [ ] Add `GoogleOAuthProvider` wrapper to app root
- [ ] Create `GoogleLoginButton` component with credential handling
- [ ] Implement token storage (localStorage/sessionStorage/Redux)
- [ ] Create API utility for authenticated requests with Bearer token
- [ ] Set up error handling for failed authentications
- [ ] Add logout functionality (clear stored token and user data)
- [ ] Test Google login flow end-to-end
- [ ] Handle token expiration and refresh
- [ ] Add loading states during authentication
- [ ] Implement protected routes that check for valid token
- [ ] Add user profile display after login
- [ ] Test on both desktop and mobile

---

## Testing Checklist

### Happy Path (New User)
- [ ] Click "Sign in with Google"
- [ ] Consent to Google OAuth permissions
- [ ] Backend creates new user automatically
- [ ] Frontend receives JWT token
- [ ] User is logged in and redirected to dashboard
- [ ] User info displays correctly

### Happy Path (Existing User)
- [ ] Click "Sign in with Google" with same Google account
- [ ] No consent screen (cached)
- [ ] Backend recognizes existing user
- [ ] Frontend receives JWT token
- [ ] User is logged in

### Error Cases
- [ ] Cancel Google OAuth consent
- [ ] Network error during authentication
- [ ] Invalid token response
- [ ] Backend server down

---

## Security Notes

⚠️ **Important:**
- Always use HTTPS in production
- Store tokens securely (consider httpOnly cookies for sensitive apps)
- Validate token expiration on frontend
- Never expose `GOOGLE_CLIENT_SECRET` on frontend
- Implement CSRF protection if needed
- Clear tokens on logout

---

## Environment Variables

Create `.env` or `.env.local`:

```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_API_BASE_URL=http://localhost:4000
```

---

## Common Issues & Solutions

### Issue: "Invalid client ID"
- Verify `GOOGLE_CLIENT_ID` is correct
- Check it's not the secret key
- Ensure environment variable is loaded

### Issue: "Redirect URI mismatch"
- Confirm backend redirect URI matches Google Cloud configuration
- Check for http vs https, port numbers, trailing slashes

### Issue: CORS errors
- Backend should have CORS configured for your frontend domain
- Check if credentials need to be included

### Issue: Token validation fails
- Ensure Bearer token format: `Authorization: Bearer <token>`
- Check token hasn't expired
- Verify token is stored correctly

---

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [JWT Understanding](https://jwt.io/)
- [Backend Auth Controller Source](./src/auth/auth.controller.ts)

