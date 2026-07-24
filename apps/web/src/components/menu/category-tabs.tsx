"use client";

import { useTranslations } from "next-intl";
import type { CategoryNode } from "@/lib/api/categories";

export function CategoryTabs({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: CategoryNode[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const t = useTranslations("menu");

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
          activeSlug === null
            ? "border-ink bg-ink text-white"
            : "border-zinc-300 bg-white text-ink hover:bg-zinc-50"
        }`}
      >
        {t("allCategories")}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.slug)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
            activeSlug === category.slug
              ? "border-ink bg-ink text-white"
              : "border-zinc-300 bg-white text-ink hover:bg-zinc-50"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
