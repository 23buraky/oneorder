import { apiRequest } from "./base";
import { toApiLocale } from "./locale";

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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  isAvailableNow: boolean;
}

export function listProducts(params: {
  locale: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<ProductListItem>> {
  const query = new URLSearchParams({ locale: toApiLocale(params.locale) });
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  return apiRequest<PaginatedResult<ProductListItem>>(`/products?${query.toString()}`);
}

export function getProductBySlug(slug: string, locale: string): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/products/${slug}?locale=${toApiLocale(locale)}`);
}

// Admin create/update only cover scalar fields + the NL translation — variant
// groups, extra groups, ingredients and allergens are managed via the menu
// import script for now, not through this form (see [[admin-product-groups]]
// follow-up if a full nested-group builder UI is ever needed).
export interface AdminProductInput {
  categoryId: string;
  sku: string;
  basePrice: number;
  isActive?: boolean;
  stock?: number;
  sortOrder?: number;
  translations: { locale: "NL"; name: string; description?: string; slug: string }[];
}

export function createProduct(input: AdminProductInput, accessToken: string): Promise<ProductDetail> {
  return apiRequest<ProductDetail>("/products", { method: "POST", body: JSON.stringify(input), accessToken });
}

export function updateProduct(
  id: string,
  input: Partial<AdminProductInput>,
  accessToken: string,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
    accessToken,
  });
}

export function deleteProduct(id: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/products/${id}`, { method: "DELETE", accessToken });
}

// Admin product list needs ALL products (including out-of-stock/inactive
// ones aren't filtered), so it calls the same public list endpoint but the
// admin UI itself doesn't hide inactive items the way the customer menu does.
export function listAllProductsForAdmin(locale: string): Promise<PaginatedResult<ProductListItem>> {
  return listProducts({ locale, pageSize: 100 });
}
