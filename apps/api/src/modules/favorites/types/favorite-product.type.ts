export interface FavoriteProductView {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  primaryImageUrl: string | null;
  isActive: boolean;
  favoritedAt: Date;
}
