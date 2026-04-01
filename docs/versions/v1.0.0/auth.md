# [v1.0.0 | Auth] Authentication system

## Rationale
Foundation auth system — login, registration, OAuth, role-based access control. Required for all protected features.

## Scope
- Credentials login/signup with email verification
- Google and Facebook OAuth with backend account sync
- Forgot/change password flows
- Role-based middleware routing (ADMIN → /admin, USER → /)
- Session management with JWT access tokens
- NextAuth type augmentation (IUser, Session, JWT)

## Summary
Fully implemented. 5 auth pages, 2 auth components, auth service with 9 endpoints, middleware with role routing.
