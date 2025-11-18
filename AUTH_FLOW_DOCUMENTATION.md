# 🔐 Authentication Flow Documentation

## 📋 Tổng quan luồng xác thực

Dự án sử dụng **NextAuth.js v5** với cả **Credentials** và **OAuth providers** (Google, Facebook).

---

## 🗺️ Sơ đồ luồng hoàn chỉnh

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. ĐĂNG KÝ (SIGNUP)
   /auth/signup
   ↓
   Nhập: firstName, lastName, email, password
   ↓
   POST /auth/signup → Backend tạo user + gửi email xác thực
   ↓
   Redirect → /auth/verify/{userId}
   ↓
   Nhập mã OTP từ email
   ↓
   POST /auth/check-code → Kích hoạt tài khoản
   ↓
   Success → /auth/login

2. ĐĂNG NHẬP (LOGIN)
   /auth/login
   ↓
   A. Credentials Login:
      Nhập: email, password
      ↓
      Server Action: authenticate() → POST /auth/login
      ↓
      Response codes:
      - 201: Success → /homepage (hoặc /dashboard nếu admin)
      - 401: Invalid credentials → Show error
      - 400 (code=2): Inactive account → Hiện Modal kích hoạt lại
   
   B. OAuth Login:
      Click "Sign in with Google/Facebook"
      ↓
      NextAuth OAuth flow
      ↓
      Success → /homepage

3. QUÊN MẬT KHẨU (FORGOT PASSWORD)
   
   Option A: Dùng Modal (hiện tại)
   /auth/login → Click "Forgot Password?" → Modal mở
   ↓
   Step 1: Nhập email
   ↓
   POST /auth/retry-password → Gửi OTP qua email
   ↓
   Step 2: Nhập OTP + mật khẩu mới
   ↓
   POST /auth/change-password → Đổi mật khẩu
   ↓
   Success → Đóng modal → Đăng nhập lại

   Option B: Dùng trang riêng (khuyến nghị - đã implement)
   /auth/login → Link "/auth/forgot-password"
   ↓
   /auth/forgot-password: Nhập email
   ↓
   POST /auth/retry-password → Gửi OTP
   ↓
   Redirect → /auth/reset-password?email={email}
   ↓
   Nhập: OTP code + new password + confirm password
   ↓
   POST /auth/change-password → Đổi mật khẩu
   ↓
   Success → /auth/login

4. KÍCH HOẠT LẠI TÀI KHOẢN
   /auth/login → Login với tài khoản chưa active
   ↓
   Error code=2 → Hiện ModalReactive
   ↓
   POST /auth/retry-active → Gửi lại mã kích hoạt
   ↓
   Nhập mã OTP
   ↓
   POST /auth/check-code → Kích hoạt tài khoản
   ↓
   Success → Đóng modal → Đăng nhập lại
```

---

## 🛠️ Backend API Endpoints cần implement

### 1. **POST /auth/signup** - Đăng ký tài khoản mới
```typescript
Request:
{
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  username: string
}

Response (Success):
{
  statusCode: 200,
  data: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    isActive: false
  }
}
```
**Backend tasks:**
- Validate email format và unique
- Hash password (bcrypt)
- Generate 6-digit OTP code
- Store user với isActive=false
- Gửi email chứa OTP

---

### 2. **POST /auth/login** - Đăng nhập
```typescript
Request:
{
  username: string,  // email
  password: string
}

Response (Success - 201):
{
  statusCode: 201,
  data: {
    user: {
      id: string,
      name: string,
      email: string,
      role: string
    },
    access_token: string
  }
}

Response (Invalid credentials - 401):
{
  statusCode: 401,
  message: "Invalid email or password"
}

Response (Inactive account - 400):
{
  statusCode: 400,
  message: "Account not activated"
}
```
**Backend tasks:**
- Validate credentials
- Check if account is active
- Generate JWT token
- Return user info + token

---

### 3. **POST /auth/retry-password** - Gửi mã reset password
```typescript
Request:
{
  email: string
}

Response (Success):
{
  statusCode: 200,
  data: {
    email: string
  }
}
```
**Backend tasks:**
- Check if email exists
- Generate 6-digit OTP
- Store OTP với expiration (15 minutes)
- Gửi email chứa OTP

---

### 4. **POST /auth/change-password** - Đổi mật khẩu
```typescript
Request:
{
  email: string,
  codeActive: string,     // OTP code
  password: string,
  confirmPassword: string
}

Response (Success):
{
  statusCode: 200,
  data: {
    message: "Password changed successfully"
  }
}
```
**Backend tasks:**
- Verify OTP code valid và chưa expired
- Validate password strength
- Hash new password
- Update user password
- Invalidate OTP code
- Optional: Gửi email thông báo đổi mật khẩu thành công

---

### 5. **POST /auth/retry-active** - Gửi lại mã kích hoạt
```typescript
Request:
{
  email: string
}

Response (Success):
{
  statusCode: 200,
  data: {
    _id: string,
    email: string
  }
}
```
**Backend tasks:**
- Generate new OTP code
- Update OTP trong database
- Gửi email chứa OTP mới

---

### 6. **POST /auth/check-code** - Xác thực OTP
```typescript
Request:
{
  code: string,    // OTP
  _id: string      // User ID
}

Response (Success):
{
  statusCode: 200,
  data: {
    message: "Account activated successfully"
  }
}
```
**Backend tasks:**
- Verify OTP code
- Set isActive=true
- Invalidate OTP code

---

## 🔧 Environment Variables cần thiết

Tạo file `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth
AUTH_SECRET=your_secret_key_here_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

---

## 📂 Cấu trúc File

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx           # Trang đăng nhập
│   │   ├── signup/page.tsx          # Trang đăng ký
│   │   ├── forgot-password/page.tsx # Trang quên MK (nhập email)
│   │   ├── reset-password/page.tsx  # Trang đặt lại MK (OTP + new pass)
│   │   └── verify/[id]/page.tsx     # Trang xác thực email
│   └── api/
│       └── auth/[...nextauth]/route.ts  # NextAuth handlers
├── components/
│   └── auth/
│       ├── modal.reactive.tsx       # Modal kích hoạt lại tài khoản
│       └── modal.change.password.tsx # Modal đổi MK (step-based)
├── utils/
│   ├── actions.ts                   # Server actions (authenticate)
│   ├── api.ts                       # API client (sendRequest)
│   └── errors.ts                    # Custom errors
├── auth.ts                          # NextAuth config
└── middleware.ts                    # Route protection
```

---

## ✅ Checklist Implementation

### Frontend (Đã hoàn thành ✅)
- [x] Trang đăng nhập với credentials
- [x] OAuth login (Google, Facebook)
- [x] Trang đăng ký
- [x] Trang quên mật khẩu (nhập email)
- [x] Trang reset password (OTP + new password)
- [x] Modal kích hoạt lại tài khoản
- [x] Modal đổi mật khẩu (step-based)
- [x] Validation form
- [x] Error handling
- [x] Loading states
- [x] Redirect logic

### Backend (Cần implement ⚠️)
- [ ] Implement tất cả 6 API endpoints trên
- [ ] Email service (gửi OTP)
- [ ] JWT token generation/validation
- [ ] Password hashing (bcrypt)
- [ ] OTP generation & validation
- [ ] Database schema (User, OTP)
- [ ] Rate limiting (prevent spam)

### Security (Khuyến nghị 🔒)
- [ ] Password strength validation (min 8 chars, uppercase, lowercase, number)
- [ ] Email format validation
- [ ] CSRF protection
- [ ] Rate limiting cho API
- [ ] OTP expiration (15 minutes)
- [ ] Brute force protection
- [ ] HTTPS only in production

---

## 🎯 Khuyến nghị

### 1. Chuyển từ Modal sang Page-based flow
**File cần sửa:** `src/app/auth/login/page.tsx`

Hiện tại đang dùng:
```tsx
<div onClick={() => setChangePassword(true)}>
  Forgot Password?
</div>
```

Nên đổi thành:
```tsx
<Link href="/auth/forgot-password">
  Forgot Password?
</Link>
```

**Lợi ích:**
- ✅ SEO-friendly (mỗi bước có URL riêng)
- ✅ Có thể bookmark/share link
- ✅ Không mất data khi refresh
- ✅ Better mobile UX

### 2. Thêm Password Strength Indicator
```tsx
// Trong signup/page.tsx
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};
```

### 3. Implement Remember Me
```tsx
// Thêm checkbox trong login form
const [rememberMe, setRememberMe] = useState(false);

// Pass to NextAuth
signIn('credentials', {
  username,
  password,
  callbackUrl: rememberMe ? '/homepage' : undefined
});
```

---

## 🧪 Testing Flow

1. **Test Signup:**
   - Đăng ký với email mới → Nhận OTP → Verify → Login

2. **Test Login:**
   - Login với account chưa active → Hiện modal → Resend OTP → Verify
   - Login với wrong password → Show error
   - Login thành công → Redirect homepage

3. **Test Forgot Password:**
   - Nhập email → Nhận OTP → Đặt lại password → Login với password mới

4. **Test OAuth:**
   - Login with Google → Success
   - Login with Facebook → Success

---

## 📞 Support

Nếu cần thêm thông tin hoặc có lỗi, check:
- Console logs trong browser
- Network tab để xem API responses
- File `src/auth.ts` cho NextAuth config
- File `src/utils/errors.ts` cho custom errors

---

**Generated:** 2025-11-17
**Author:** GitHub Copilot
**Version:** 1.0
