import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, listProducts } from "@/lib/api/products";

export function useProducts(params: { locale: string; categorySlug?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
  });
}

export function useProduct(slug: string, locale: string) {
  return useQuery({
    queryKey: ["products", slug, locale],
    queryFn: () => getProductBySlug(slug, locale),
    enabled: Boolean(slug),
  });
}
