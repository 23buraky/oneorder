export const BCRYPT_SALT_ROUNDS = 12;

export const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
export const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export const PASSWORD_RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1h

export const REFRESH_TOKEN_BYTES = 40;

export const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for this email address, a reset link has been sent.";
