// Reads the "exp" claim straight out of an access token so the frontend
// knows exactly when to refresh — without needing a JWT library on the client,
// and without trusting a hardcoded "expires in 15 minutes" assumption that
// could drift from the backend's actual JWT_ACCESS_EXPIRES_IN config.
export function getJwtExpiryMs(token: string): number {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    throw new Error("Malformed access token: missing payload segment");
  }

  const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const json = Buffer.from(padded, "base64").toString("utf8");
  const payload = JSON.parse(json) as { exp?: number };

  if (!payload.exp) {
    throw new Error("Malformed access token: missing exp claim");
  }

  return payload.exp * 1000;
}
