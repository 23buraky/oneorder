"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { ProductListItem } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import { FavoriteButton } from "@/components/product/favorite-button";

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTranslations("menu");

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-300">
            ONE ORDER
          </div>
        )}
        {!product.isAvailableNow && (
          <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {t("unavailable")}
          </span>
        )}
        <FavoriteButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold text-ink">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-xs text-zinc-500">{product.description}</p>
        )}
        <div className="mt-auto pt-2 text-sm font-bold text-ink">
          {t("from")} {formatPrice(product.basePrice)}
        </div>
      </div>
    </Link>
  );
}
