import { sendRequest } from "@/utils/api";
import {
  AuthResponseEntity,
  ChangePasswordRequest,
  CheckCodeRequest,
  CreateUserByGoogleAccountDto,
  LoginRequest,
  LoginResponse,
  ProfileResponseEntity,
  RetryActiveRequest,
  RetryPasswordRequest,
  SignupRequest,
  SignupResponse,
  UserEntity,
} from "@/dto/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const authService = {
  login: (body: LoginRequest) =>
    sendRequest<IBackendRes<LoginResponse>>({
      url: `${BASE_URL}/auth/login`,
      method: "POST",
      body,
    }),

  googleAuth: () =>
    sendRequest<IBackendRes<LoginResponse>>({
      url: `${BASE_URL}/auth/google`,
      method: "GET",
    }),

  googleAuthRedirect: () =>
    sendRequest<IBackendRes<LoginResponse>>({
      url: `${BASE_URL}/auth/google/google-redirect`,
      method: "GET",
    }),

  createUserByGoogleAccount: (body: CreateUserByGoogleAccountDto) =>
    sendRequest<IBackendRes<LoginResponse>>({
      url: `${BASE_URL}/user/google-account`,
      method: "POST",
      body,
    }),

  signup: (body: SignupRequest) =>
    sendRequest<IBackendRes<SignupResponse>>({
      url: `${BASE_URL}/auth/signup`,
      method: "POST",
      body,
    }),

  checkCode: (body: CheckCodeRequest) =>
    sendRequest<IBackendRes<UserEntity>>({
      url: `${BASE_URL}/auth/check-code`,
      method: "POST",
      body,
    }),

  retryActive: (body: RetryActiveRequest) =>
    sendRequest<IBackendRes<UserEntity>>({
      url: `${BASE_URL}/auth/retry-active`,
      method: "POST",
      body,
    }),

  retryPassword: (body: RetryPasswordRequest) =>
    sendRequest<IBackendRes<AuthResponseEntity>>({
      url: `${BASE_URL}/auth/retry-password`,
      method: "POST",
      body,
    }),

  checkEmail: (email: string) =>
    sendRequest<IBackendRes<{ exists: boolean }>>({
      url: `${BASE_URL}/auth/check-email`,
      method: "POST",
      body: { email },
    }),

  changePassword: (body: ChangePasswordRequest) =>
    sendRequest<IBackendRes<AuthResponseEntity>>({
      url: `${BASE_URL}/auth/change-password`,
      method: "POST",
      body,
    }),

  profile: (accessToken: string) =>
    sendRequest<IBackendRes<ProfileResponseEntity>>({
      url: `${BASE_URL}/auth/profile`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};
