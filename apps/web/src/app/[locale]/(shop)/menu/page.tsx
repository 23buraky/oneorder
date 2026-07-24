"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCategoryTree } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { ProductCard } from "@/components/menu/product-card";

// useSearchParams() requires a Suspense boundary so `next build` can still
// prerender a static shell around this dynamic segment.
export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}

function MenuContent() {
  const locale = useLocale();
  const t = useTranslations("menu");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");

  const { data: categories } = useCategoryTree(locale);
  const { data: products, isLoading } = useProducts({
    locale,
    categorySlug: activeSlug ?? undefined,
    pageSize: 100,
  });

  const handleSelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold text-ink">{t("title")}</h1>

      {categories && categories.length > 0 && (
        <div className="mb-8">
          <CategoryTabs categories={categories} activeSlug={activeSlug} onSelect={handleSelect} />
        </div>
      )}

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {products && products.items.length === 0 && (
        <p className="text-sm text-zinc-500">{t("empty")}</p>
      )}

      {products && products.items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
