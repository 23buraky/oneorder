import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// "next-auth" and "next-auth/jwt" re-export their User/Session/JWT types
// straight from "@auth/core" (`export type { User } from "@auth/core/types"`),
// so both the "next-auth" specifiers (for consumers importing from
// "next-auth") and the underlying "@auth/core" specifiers (used internally by
// the library's own callback signatures) need augmenting.
//
// Each field list below is repeated as OWN members in every `declare module`
// block on purpose: TypeScript only lets an augmentation narrow an inherited
// optional property (e.g. the base `id?: string`) to required when the
// override is itself an own-declared member — routing it through a shared
// `extends`-only interface silently loses the override.

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    accessToken: string;
    error?: "RefreshTokenError";
    user: {
      id: string;
      role: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshTokenError";
  }
}

declare module "@auth/core/types" {
  interface User {
    id: string;
    role: string;
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    accessToken: string;
    error?: "RefreshTokenError";
    user: {
      id: string;
      role: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    isEmailVerified: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshTokenError";
  }
}
