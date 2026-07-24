export interface ProductListItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  primaryImageUrl: string | null;
  isActive: boolean;
  stock: number | null;
  allergenNames: string[];
  isAvailableNow: boolean;
}

export interface ProductVariantView {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ProductVariantGroupView {
  id: string;
  name: string;
  sortOrder: number;
  variants: ProductVariantView[];
}

export interface ProductExtraView {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductExtraGroupView {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  extras: ProductExtraView[];
}

export interface ProductAvailabilityView {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ProductDetail {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  vatCategory: string;
  isActive: boolean;
  stock: number | null;
  images: { url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[];
  variantGroups: ProductVariantGroupView[];
  extraGroups: ProductExtraGroupView[];
  ingredients: { id: string; name: string }[];
  allergens: { id: string; name: string; icon: string | null }[];
  availability: ProductAvailabilityView[];
  isAvailableNow: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
