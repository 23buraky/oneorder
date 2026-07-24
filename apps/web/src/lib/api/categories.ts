import { apiRequest } from "./base";
import { toApiLocale } from "./locale";

export interface CategoryNode {
  id: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  children: CategoryNode[];
}

export function getCategoryTree(locale: string): Promise<CategoryNode[]> {
  return apiRequest<CategoryNode[]>(`/categories?locale=${toApiLocale(locale)}`);
}

export function getCategoryBySlug(slug: string, locale: string): Promise<CategoryNode> {
  return apiRequest<CategoryNode>(`/categories/${slug}?locale=${toApiLocale(locale)}`);
}

export interface CategoryInput {
  slug: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string;
  translations: { locale: "NL"; name: string; description?: string }[];
}

export function createCategory(input: CategoryInput, accessToken: string): Promise<CategoryNode> {
  return apiRequest("/categories", { method: "POST", body: JSON.stringify(input), accessToken });
}

export function updateCategory(id: string, input: Partial<CategoryInput>, accessToken: string): Promise<CategoryNode> {
  return apiRequest(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(input), accessToken });
}

export function deleteCategory(id: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/categories/${id}`, { method: "DELETE", accessToken });
}
