"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { formatPrice } from "@/lib/format";

export default function AccountFavoritesPage() {
  const locale = useLocale();
  const t = useTranslations("account.favorites");
  const { data: favorites, isLoading } = useFavorites(locale);
  const removeFavorite = useRemoveFavorite(locale);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">{t("title")}</h1>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {favorites && favorites.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">{t("empty")}</p>
          <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
            {t("browseMenu")}
          </Link>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {favorites.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="aspect-[4/3] w-full bg-zinc-100">
                  {product.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.primaryImageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-300">
                      ONE ORDER
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-ink">{product.name}</p>
                  <p className="text-sm font-bold text-ink">{formatPrice(product.basePrice)}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite.mutate(product.id)}
                className="w-full border-t border-zinc-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
