import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { apiLogin, apiGetMe, apiRefreshTokens, ApiError } from "./api-client";
import { getJwtExpiryMs } from "./jwt.util";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    // Email + password login, proxied straight through to the NestJS API.
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const email = typeof raw?.email === "string" ? raw.email : undefined;
        const password = typeof raw?.password === "string" ? raw.password : undefined;
        if (!email || !password) return null;

        try {
          const result = await apiLogin(email, password);
          return {
            id: result.user.id,
            email: result.user.email,
            name: `${result.user.firstName} ${result.user.lastName}`,
            role: result.user.role,
            isEmailVerified: result.user.isEmailVerified,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpires: getJwtExpiryMs(result.accessToken),
          };
        } catch (error) {
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
    // Used only by /auth/callback right after the NestJS-driven Google/Apple
    // OAuth flow redirects back with a token pair in the URL fragment — this
    // provider does not perform OAuth itself, it just adopts tokens the API
    // already issued and turns them into an Auth.js session.
    Credentials({
      id: "oauth-token-exchange",
      name: "OAuth token exchange",
      credentials: {
        accessToken: { label: "Access token", type: "text" },
        refreshToken: { label: "Refresh token", type: "text" },
      },
      authorize: async (raw) => {
        const accessToken = typeof raw?.accessToken === "string" ? raw.accessToken : undefined;
        const refreshToken = typeof raw?.refreshToken === "string" ? raw.refreshToken : undefined;
        if (!accessToken || !refreshToken) return null;

        try {
          const me = await apiGetMe(accessToken);
          return {
            id: me.id,
            email: me.email,
            name: `${me.firstName} ${me.lastName}`,
            role: me.role,
            isEmailVerified: me.isEmailVerified,
            accessToken,
            refreshToken,
            accessTokenExpires: getJwtExpiryMs(accessToken),
          };
        } catch (error) {
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      if (user) {
        // Our two Credentials providers always resolve to our own User shape
        // (see next-auth.d.ts) — never the base adapter's minimal User type,
        // since this app has no database adapter configured. `id` is cast
        // explicitly because @auth/core's base User declares it optional,
        // and TS interface merging can't narrow an inherited optional
        // property to required through augmentation alone.
        const authUser = user as User;
        return {
          ...token,
          id: authUser.id as string,
          role: authUser.role,
          isEmailVerified: authUser.isEmailVerified,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          accessTokenExpires: authUser.accessTokenExpires,
        };
      }

      // Refresh 30s before actual expiry to absorb request latency.
      if (Date.now() < token.accessTokenExpires - 30_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    session: ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isEmailVerified = token.isEmailVerified;
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const result = await apiRefreshTokens(token.refreshToken);
    return {
      ...token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      accessTokenExpires: getJwtExpiryMs(result.accessToken),
      // Re-sync role/verification status on every refresh — without this, a
      // role change (e.g. promoted to admin) or email verification made
      // server-side stays invisible in the session until a full re-login,
      // since a silent token refresh would otherwise just keep stale values.
      role: result.user.role,
      isEmailVerified: result.user.isEmailVerified,
      error: undefined,
    };
  } catch {
    // The refresh token itself is invalid/expired/revoked — the session can't
    // be salvaged. Client code checks session.error and forces a sign-out.
    return { ...token, error: "RefreshTokenError" };
  }
}
