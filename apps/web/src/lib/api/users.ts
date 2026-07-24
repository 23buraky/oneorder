import { apiRequest } from "./base";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  preferredLocale: string;
  marketingOptIn: boolean;
  role: string;
  authProvider: string;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  loyaltyLevel: string;
  createdAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingOptIn?: boolean;
}

export function getProfile(accessToken: string): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me", { accessToken });
}

export function updateProfile(input: UpdateProfileInput, accessToken: string): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me", { method: "PATCH", body: JSON.stringify(input), accessToken });
}

export function changePassword(
  input: { currentPassword: string; newPassword: string },
  accessToken: string,
): Promise<void> {
  return apiRequest<void>("/users/me/password", { method: "PATCH", body: JSON.stringify(input), accessToken });
}
