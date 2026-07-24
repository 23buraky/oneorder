export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface OAuthProfileInput {
  provider: "GOOGLE" | "APPLE";
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  loyaltyLevel: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
