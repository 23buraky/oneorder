import { apiRequest, ApiError } from "./api/base";

export { ApiError };

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  loyaltyLevel: string;
}

export interface ApiAuthResult {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export function apiLogin(email: string, password: string): Promise<ApiAuthResult> {
  return apiRequest<ApiAuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  marketingOptIn?: boolean;
}): Promise<ApiAuthResult> {
  return apiRequest<ApiAuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function apiGetMe(accessToken: string): Promise<ApiUser> {
  return apiRequest<ApiUser>("/auth/me", { accessToken });
}

export function apiRefreshTokens(refreshToken: string): Promise<ApiAuthResult> {
  return apiRequest<ApiAuthResult>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function apiLogout(refreshToken: string): Promise<void> {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function apiVerifyEmail(token: string): Promise<void> {
  return apiRequest<void>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function apiForgotPassword(email: string): Promise<void> {
  return apiRequest<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function apiResetPassword(token: string, newPassword: string): Promise<void> {
  return apiRequest<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
