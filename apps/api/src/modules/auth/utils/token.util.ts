import { randomBytes, createHash } from "node:crypto";

// Opaque tokens (email verification, password reset, refresh tokens) are
// generated as random hex strings and only ever persisted as a SHA-256 hash —
// so a leaked database dump doesn't hand out usable tokens.
export function generateOpaqueToken(byteLength: number): string {
  return randomBytes(byteLength).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
