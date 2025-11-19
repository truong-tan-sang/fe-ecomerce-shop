// Auth DTOs based on openapi.json and current usage

export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginResponse = ILogin;

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
