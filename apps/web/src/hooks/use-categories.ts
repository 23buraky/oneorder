import { useQuery } from "@tanstack/react-query";
import { getCategoryTree, getCategoryBySlug } from "@/lib/api/categories";

export function useCategoryTree(locale: string) {
  return useQuery({
    queryKey: ["categories", locale],
    queryFn: () => getCategoryTree(locale),
  });
}

export function useCategory(slug: string, locale: string) {
  return useQuery({
    queryKey: ["categories", slug, locale],
    queryFn: () => getCategoryBySlug(slug, locale),
    enabled: Boolean(slug),
  });
}
