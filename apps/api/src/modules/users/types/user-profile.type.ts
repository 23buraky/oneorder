export interface UserProfileView {
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
  createdAt: Date;
}
