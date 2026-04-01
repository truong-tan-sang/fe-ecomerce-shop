# Auth

## Non-Technical Description

Handles all user authentication for the platform. Users can sign up with email/password, log in with credentials or social accounts (Google, Facebook), verify their email, and reset their password. The system distinguishes between regular users, admins, and operators — admins are routed to the admin panel, users to the storefront.

- Email/password login and signup with email verification
- Google and Facebook OAuth with backend account sync
- Forgot password and change password flows
- Role-based route protection (middleware redirects)
- Session management with JWT access tokens

## Technical Implementation

**Auth config:** `src/auth.ts` — NextAuth setup with 3 providers (Credentials, Google, Facebook). JWT callback attaches `access_token`, `role`, `isAdmin`. Session callback exposes these to client.

**Type augmentation:** `src/types/next-auth.d.ts` — extends NextAuth `Session`, `JWT`, declares `IUser` with `access_token`, `role`, `isAdmin`, `firstName`, `lastName`.

**Middleware:** `src/middleware.ts` — role-based routing. Admin users → `/admin`, non-admin on `/admin/*` → `/`. Matcher excludes auth/api/static routes.

**Service:** `src/services/auth.ts` — `authService` with `login`, `signup`, `checkCode`, `retryActive`, `retryPassword`, `changePassword`, `profile`, `googleAuth`, `createUserByGoogleAccount`.

**Pages:**
- `src/app/auth/login/page.tsx` — login form
- `src/app/auth/signup/page.tsx` — registration form
- `src/app/auth/verify/[id]/page.tsx` — email verification
- `src/app/auth/forgot-password/page.tsx` — password reset request
- `src/app/auth/change-password/page.tsx` — password change

**Components:** `src/components/auth/verify.tsx`, `src/components/auth/modal.reactive.tsx`

**Server actions:** `src/utils/actions.ts` — `authenticate()` wraps `signIn("credentials")`

**Errors:** `src/utils/errors.ts` — `InvalidEmailPasswordError`, `InactiveAccountError`

## Version History
- v1.0.0 — Baseline: credentials + Google + Facebook OAuth, email verification, password management, role middleware
