export default () => ({
  env: process.env.NODE_ENV,
  // Render/most PaaS providers inject PORT and expect the app to bind to
  // it; API_PORT stays first for local dev where PORT usually isn't set.
  port: parseInt(process.env.API_PORT ?? process.env.PORT ?? "4000", 10),
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  corsOrigin: process.env.CORS_ORIGIN,

  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/google/callback`,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/apple/callback`,
    },
  },

  mail: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? "60", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
  },
});
