# Detailed Google OAuth Data Flow with Exact Payloads

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Your App)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Step 1: User clicks "Sign in with Google"
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GOOGLE (OAuth Server)                            │
│                                                                             │
│  User enters Google account credentials → Consent screen → Permissions      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          Step 2: Google redirects back
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Your Server)                               │
│                      GET /auth/google/google-redirect                       │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 3: Receive from Google (Passport.js handles this)              │  │
│  │                                                                      │  │
│  │ Google sends:                                                       │  │
│  │  - authorization_code (in query params)                            │  │
│  │  - state (optional, for security)                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                          Passport exchanges code for tokens                │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 4: Google sends tokens + profile                              │  │
│  │                                                                      │  │
│  │ Google Response (sent to backend):                                  │  │
│  │ {                                                                   │  │
│  │   "access_token": "ya29.a0AfH6SMB...",                            │  │
│  │   "refresh_token": "1//0gU...",                                    │  │
│  │   "expires_in": 3599,                                              │  │
│  │   "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA..."                │  │
│  │ }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│          Passport uses access_token to fetch user profile from Google       │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 5: Google Profile Data (from Google API)                      │  │
│  │                                                                      │  │
│  │ Google sends to backend:                                            │  │
│  │ {                                                                   │  │
│  │   "id": "102938457293847",                                         │  │
│  │   "displayName": "John Doe",                                        │  │
│  │   "name": {                                                         │  │
│  │     "familyName": "Doe",                                           │  │
│  │     "givenName": "John"                                            │  │
│  │   },                                                                │  │
│  │   "emails": [                                                       │  │
│  │     {                                                               │  │
│  │       "value": "john.doe@gmail.com",                               │  │
│  │       "type": "account"                                            │  │
│  │     }                                                               │  │
│  │   ],                                                                │  │
│  │   "photos": [                                                       │  │
│  │     {                                                               │  │
│  │       "value": "https://lh3.googleusercontent.com/a/..."           │  │
│  │     }                                                               │  │
│  │   ]                                                                 │  │
│  │ }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│         GoogleStrategy.validate() extracts data from Google profile         │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 6: Backend processes in google.strategy.ts validate()          │  │
│  │                                                                      │  │
│  │ Extracted user object:                                              │  │
│  │ {                                                                   │  │
│  │   "email": "john.doe@gmail.com",                                   │  │
│  │   "firstName": "John",                                              │  │
│  │   "lastName": "Doe",                                                │  │
│  │   "picture": "https://lh3.googleusercontent.com/a/...",            │  │
│  │   "accessToken": "ya29.a0AfH6SMB...",                             │  │
│  │   "refreshToken": "1//0gU..."                                      │  │
│  │ }                                                                   │  │
│  │                                                                      │  │
│  │ NOTE: profile.id is NOT extracted! Bug?                            │  │
│  │ (Should store googleId but it's not being captured)                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│    auth.service.googleLogin(req) is called with req.user from above        │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 7: Backend checks if user exists                              │  │
│  │                                                                      │  │
│  │ Query: SELECT * FROM users WHERE email = 'john.doe@gmail.com'     │  │
│  │                                                                      │  │
│  │ Result: User NOT found (first time)                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 8: Backend creates NEW user in database                        │  │
│  │                                                                      │  │
│  │ Insert user with:                                                   │  │
│  │ {                                                                   │  │
│  │   "firstName": "John",                                              │  │
│  │   "lastName": "Doe",                                                │  │
│  │   "email": "john.doe@gmail.com",                                   │  │
│  │   "phone": "",                                                      │  │
│  │   "googleId": ??? (MISSING - not extracted from profile)           │  │
│  │   "username": "john.doe" + random(0-99999),  // e.g., "john.doe47829"    │  │
│  │   "password": null (no password for Google auth),                  │  │
│  │   "role": "USER",                                                   │  │
│  │   "isActive": true,                                                 │  │
│  │   "isAdmin": false,                                                 │  │
│  │   "gender": "OTHER",                                                │  │
│  │   "createdAt": "2025-12-06T10:30:00Z",                            │  │
│  │   "codeActive": "550e8400-e29b-41d4-a716-446655440000",           │  │
│  │   "codeActiveExpire": "2025-12-06T10:35:00Z" (+5 min)             │  │
│  │   "staffCode": "",                                                  │  │
│  │   "loyaltyCard": ""                                                 │  │
│  │ }                                                                   │  │
│  │                                                                      │  │
│  │ Database returns created user with ID = 123                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Step 9: Backend generates JWT and sends to frontend                │  │
│  │                                                                      │  │
│  │ JWT Payload (signed with backend secret):                           │  │
│  │ {                                                                   │  │
│  │   "sub": 123,                    // user.id                        │  │
│  │   "username": "john.doe@gmail.com",                               │  │
│  │   "role": "USER",                                                   │  │
│  │   "isAdmin": false,                                                 │  │
│  │   "firstName": "John",                                              │  │
│  │   "lastName": "Doe",                                                │  │
│  │   "name": "John Doe",                                               │  │
│  │   "iat": 1701851400,          // issued at                         │  │
│  │   "exp": 1701855000           // expires in 1 hour                 │  │
│  │ }                                                                   │  │
│  │                                                                      │  │
│  │ JWT Token Example:                                                  │  │
│  │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.                            │  │
│  │ eyJzdWIiOjEyMywidXNlcm5hbWUiOiJqb2huLmRvZUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiJ9. │  │
│  │ SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c                     │  │
│  │                                                                      │  │
│  │ HTTP Response to frontend (HTTP 302 redirect or JSON):              │  │
│  │ {                                                                   │  │
│  │   "user": {                                                         │  │
│  │     "id": 123,                                                      │  │
│  │     "firstName": "John",                                            │  │
│  │     "lastName": "Doe",                                              │  │
│  │     "name": "John Doe",                                             │  │
│  │     "email": "john.doe@gmail.com",                                 │  │
│  │     "role": "USER",                                                 │  │
│  │     "isAdmin": false                                                │  │
│  │   },                                                                │  │
│  │   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."    │  │
│  │ }                                                                   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Step 10: Frontend receives response
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Your App)                              │
│                                                                             │
│  Store in localStorage:                                                     │
│  {                                                                          │
│    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",            │
│    "user": {                                                                │
│      "id": 123,                                                             │
│      "firstName": "John",                                                   │
│      "lastName": "Doe",                                                     │
│      "name": "John Doe",                                                    │
│      "email": "john.doe@gmail.com",                                         │
│      "role": "USER",                                                        │
│      "isAdmin": false                                                       │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
│  User is logged in! ✓                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Exact API Call Sequence

### 1️⃣ FRONTEND → Browser Redirect (Step 1-2)

**User clicks "Sign in with Google" button:**

```
GET https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com&
  redirect_uri=http://localhost:4000/auth/google/google-redirect&
  response_type=code&
  scope=email%20profile&
  state=optional_state_data
```

**User logs in to Google → Consents → Browser redirects to:**

```
GET http://localhost:4000/auth/google/google-redirect?
  code=4/0AY0e-g7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&
  state=optional_state_data
```

---

### 2️⃣ BACKEND receives callback (Step 3-6)

**Backend endpoint triggered:**
```
GET /auth/google/google-redirect?code=4/0AY0e-g7XXX...&state=XXX
```

**Passport (behind the scenes) exchanges `code` for tokens:**
```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=4/0AY0e-g7XXX...&
client_id=YOUR_GOOGLE_CLIENT_ID&
client_secret=YOUR_GOOGLE_CLIENT_SECRET&
redirect_uri=http://localhost:4000/auth/google/google-redirect
```

**Google responds with:**
```json
{
  "access_token": "ya29.a0AfH6SMB2Jk3X8jkL9mK...",
  "expires_in": 3599,
  "refresh_token": "1//0gU7jK8L9mN0oP1qR2s...",
  "scope": "openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhYzM..."
}
```

**Passport uses `access_token` to get user profile:**
```
GET https://www.googleapis.com/oauth2/v2/userinfo
Authorization: Bearer ya29.a0AfH6SMB2Jk3X8jkL9mK...
```

**Google responds with profile:**
```json
{
  "id": "102938457293847",
  "email": "john.doe@gmail.com",
  "verified_email": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a/AEdFTp7X4Y5z..."
}
```

**Your code extracts and creates user in database:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "googleId": "102938457293847",  // ← BUG: Currently NOT stored!
  "username": "john.doe47829",
  "isActive": true,
  "role": "USER"
}
```

---

### 3️⃣ BACKEND → FRONTEND response (Step 9-10)

**Backend sends HTTP 302 redirect or JSON:**

```
HTTP/1.1 302 Found (or 200 OK with JSON body)

{
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "USER",
    "isAdmin": false
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMywidXNlcm5hbWUiOiJqb2huLmRvZUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwMTg1MTQwMCwiZXhwIjoxNzAxODU1MDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

---

### 4️⃣ FRONTEND stores and uses token

**Store in localStorage:**
```javascript
localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
localStorage.setItem('user', JSON.stringify({
  id: 123,
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  role: 'USER',
  isAdmin: false
}));
```

**Use for authenticated requests:**
```
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## What FRONTEND Sends vs Receives

### 📤 FRONTEND SENDS to Backend
✅ Nothing directly! Browser handles OAuth flow
- The `authorization_code` is sent from Google to backend (not from frontend)
- Frontend only sends: Bearer token in `Authorization` header for subsequent requests

### 📥 FRONTEND RECEIVES from Google
✅ User gets redirected (no direct API call)
- Google redirects browser to: `http://localhost:4000/auth/google/google-redirect?code=XXX&state=XXX`

### 📥 FRONTEND RECEIVES from Backend
✅ JSON response with:
```json
{
  "user": { /* user object */ },
  "access_token": "JWT_TOKEN_STRING"
}
```

---

## Database Schema (What Gets Stored)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255) NULL,  -- NULL for Google auth
  googleId VARCHAR(255) UNIQUE,  -- ← From Google's "id" field
  phone VARCHAR(20),
  role ENUM('USER', 'ADMIN', 'OPERATOR') DEFAULT 'USER',
  isActive BOOLEAN DEFAULT true,
  isAdmin BOOLEAN DEFAULT false,
  gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT 'OTHER',
  createdAt DATETIME,
  codeActive VARCHAR(255),  -- Email verification code
  codeActiveExpire DATETIME,
  staffCode VARCHAR(100),
  loyaltyCard VARCHAR(100),
  -- Plus timestamps, etc.
);
```

---

## Summary: What You Need to Know

| Item | Source | Value |
|------|--------|-------|
| **Google Client ID** | Google Cloud Console | `YOUR_APP.apps.googleusercontent.com` |
| **Google Client Secret** | Google Cloud Console (BACKEND ONLY) | Secret key |
| **Authorization Code** | Google → Backend | `4/0AY0e-g7XXX...` (short-lived) |
| **Google Access Token** | Google → Backend | `ya29.a0AfH6SMB...` (for API calls) |
| **Google Refresh Token** | Google → Backend | `1//0gU7jK8...` (for renewing access) |
| **User Profile** | Google API → Backend | `{id, email, name, picture}` |
| **JWT Access Token** | Backend → Frontend | `eyJhbGciOi...` (for your API) |
| **Stored User ID** | Backend DB | `123` (your database ID) |
| **Google ID** | Backend DB | `102938457293847` (Google's user ID) |

---

## ⚠️ Current Issues Found

1. **Google ID NOT stored** - Line in auth.service.ts uses `req.user.id` but that's never extracted in google.strategy.ts
   - Google sends `profile.id` = `102938457293847`
   - Code tries to use `req.user.id` (undefined)
   - Should fix: extract `profile.id` in validate()

2. **No refresh token handling** - Token stored but never refreshed
   - Google access tokens expire (usually 1 hour)
   - No logic to refresh using refresh_token

3. **Profile picture not stored** - Google sends photo URL but it's not saved to database

