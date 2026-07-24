"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useProduct } from "@/hooks/use-products";
import { useAddCartItem } from "@/hooks/use-cart";
import { VariantGroupSelector } from "@/components/product/variant-group-selector";
import { ExtraGroupSelector } from "@/components/product/extra-group-selector";
import { FavoriteButton } from "@/components/product/favorite-button";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/base";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const locale = useLocale();
  const t = useTranslations("product");
  const { data: product, isLoading } = useProduct(params.slug, locale);
  const addItem = useAddCartItem(locale);

  // Real menu data only ever has one variant group per product (e.g. "Size"),
  // matching the API's own validation (a single selectedVariantId per line) —
  // rendering multiple groups here would be ambiguous with that constraint.
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const defaultVariantId = product?.variantGroups[0]?.variants.find((v) => v.isDefault)?.id ?? null;
  const activeVariantId = selectedVariantId ?? defaultVariantId;

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const variantModifier =
      product.variantGroups.flatMap((g) => g.variants).find((v) => v.id === activeVariantId)?.priceModifier ?? 0;
    const extrasModifier = product.extraGroups
      .flatMap((g) => g.extras)
      .filter((extra) => selectedExtraIds.has(extra.id))
      .reduce((sum, extra) => sum + extra.priceModifier, 0);
    return product.basePrice + variantModifier + extrasModifier;
  }, [product, activeVariantId, selectedExtraIds]);

  const missingRequiredGroup = useMemo(() => {
    if (!product) return null;
    if (product.variantGroups.length > 0 && !activeVariantId) return true;
    return product.extraGroups.some((group) => {
      const count = group.extras.filter((extra) => selectedExtraIds.has(extra.id)).length;
      const required = group.isRequired ? Math.max(group.minSelect, 1) : group.minSelect;
      return count < required;
    });
  }, [product, activeVariantId, selectedExtraIds]);

  const toggleExtra = (groupExtras: { id: string }[], maxSelect: number, extraId: string) => {
    setSelectedExtraIds((current) => {
      const next = new Set(current);
      if (next.has(extraId)) {
        next.delete(extraId);
        return next;
      }
      const selectedInGroup = groupExtras.filter((extra) => next.has(extra.id)).length;
      if (selectedInGroup >= maxSelect) return current;
      next.add(extraId);
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!product || missingRequiredGroup) return;
    try {
      await addItem.mutateAsync({
        productId: product.id,
        variantId: activeVariantId ?? undefined,
        extraIds: [...selectedExtraIds],
        quantity,
      });
      setJustAdded(true);
      setQuantity(1);
      setTimeout(() => setJustAdded(false), 2500);
    } catch {
      // addItem.error is rendered below
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-zinc-500">...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">{t("notFound")}</p>
        <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
          {t("backToMenu")}
        </Link>
      </div>
    );
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/menu" className="mb-6 inline-block text-sm text-zinc-500 hover:text-ink">
        &larr; {t("backToMenu")}
      </Link>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-300">
              ONE ORDER
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-ink">{product.name}</h1>
              <FavoriteButton productId={product.id} className="static shadow-none" />
            </div>
            {product.description && <p className="mt-2 text-sm text-zinc-600">{product.description}</p>}
            {!product.isAvailableNow && (
              <p className="mt-2 text-sm font-semibold text-red-600">{t("unavailableNow")}</p>
            )}
          </div>

          {product.allergens.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t("allergensLabel")}
              </p>
              <p className="text-sm text-zinc-600">{product.allergens.map((a) => a.name).join(", ")}</p>
            </div>
          )}

          {product.variantGroups.map((group) => (
            <VariantGroupSelector
              key={group.id}
              group={group}
              selectedVariantId={activeVariantId}
              onSelect={setSelectedVariantId}
            />
          ))}

          {product.extraGroups.map((group) => (
            <ExtraGroupSelector
              key={group.id}
              group={group}
              selectedExtraIds={selectedExtraIds}
              onToggle={(extraId) => toggleExtra(group.extras, group.maxSelect, extraId)}
            />
          ))}

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-200 pt-5">
            <div className="flex items-center gap-3 rounded-md border border-zinc-300 px-2 py-1.5">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center text-ink"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="+"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-6 w-6 items-center justify-center text-ink"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={Boolean(missingRequiredGroup) || !product.isAvailableNow || addItem.isPending}
              className="flex-1 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("addToCart")} &middot; {formatPrice(unitPrice * quantity)}
            </button>
          </div>

          {justAdded && <p className="text-sm font-semibold text-emerald-700">{t("added")}</p>}
          {addItem.error && (
            <p className="text-sm text-red-600">
              {addItem.error instanceof ApiError ? addItem.error.message : t("genericError")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
