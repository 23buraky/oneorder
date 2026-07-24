import { apiRequest } from "./base";
import { toApiLocale } from "./locale";

export interface FavoriteProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  primaryImageUrl: string | null;
  isActive: boolean;
  favoritedAt: string;
}

export function listFavorites(locale: string, accessToken: string): Promise<FavoriteProduct[]> {
  return apiRequest<FavoriteProduct[]>(`/favorites?locale=${toApiLocale(locale)}`, { accessToken });
}

export function addFavorite(productId: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/favorites/${productId}`, { method: "POST", accessToken });
}

export function removeFavorite(productId: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/favorites/${productId}`, { method: "DELETE", accessToken });
}
