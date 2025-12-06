// Auth DTOs based on openapi.json

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginUserData {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'OPERATOR';
  isAdmin: boolean;
}

export interface LoginResponseEntity {
  user: LoginUserData;
  access_token: string;
}

export type LoginResponse = LoginResponseEntity;

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
}

export interface SignupResponse {
  id: string;
  email?: string;
}

export interface CreateUserByGoogleAccountDto {
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email: string;
  phone: string;
  googleId: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'OPERATOR';
  createdAt: string;
  isActive: boolean;
  codeActive: string;
  codeActiveExpire: string;
  staffCode: string;
  isAdmin: boolean;
  loyaltyCard: string;
}

export interface CheckCodeRequest {
  id: string;
  codeActive: string;
}

export interface RetryActiveRequest {
  email: string;
}

export interface RetryPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  codeActive: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export interface ProfileResponse {
  id: string;
  name?: string;
  email: string;
}

export interface GoogleAuthRequest {
  firstName: string;
  lastName: string;
  email: string;
  googleId: string;
  picture?: string;
}
