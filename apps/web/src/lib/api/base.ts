export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends RequestInit {
  accessToken?: string;
}

// `credentials: "include"` matters here: the API runs on a different origin
// (localhost:4000 vs localhost:3000) and the cart relies on a browser cookie
// (cart_token) for guest identity — without this, that cookie never round-trips.
export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  const { accessToken, headers, ...init } = options ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new ApiError(message ?? `Request to ${path} failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
