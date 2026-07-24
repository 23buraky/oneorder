import type { ProductVariantGroupView } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";

export function VariantGroupSelector({
  group,
  selectedVariantId,
  onSelect,
}: {
  group: ProductVariantGroupView;
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold text-ink">{group.name}</legend>
      <div className="space-y-2">
        {group.variants.map((variant) => (
          <label
            key={variant.id}
            className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
              selectedVariantId === variant.id
                ? "border-ink bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name={`variant-group-${group.id}`}
                checked={selectedVariantId === variant.id}
                onChange={() => onSelect(variant.id)}
                className="accent-gold"
              />
              {variant.name}
            </span>
            {variant.priceModifier !== 0 && (
              <span className="text-zinc-500">
                {variant.priceModifier > 0 ? "+" : ""}
                {formatPrice(variant.priceModifier)}
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
