import type { UserRole } from "@one-order/database";

// Shape attached to `request.user` by Passport strategies. Deliberately a
// narrow projection of the User model — never the full row with password hash.
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}
