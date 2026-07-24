import { useTranslations } from "next-intl";
import type { ProductExtraGroupView } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";

export function ExtraGroupSelector({
  group,
  selectedExtraIds,
  onToggle,
}: {
  group: ProductExtraGroupView;
  selectedExtraIds: Set<string>;
  onToggle: (extraId: string) => void;
}) {
  const t = useTranslations("product");
  const selectedCount = group.extras.filter((extra) => selectedExtraIds.has(extra.id)).length;
  const atMax = selectedCount >= group.maxSelect;

  const helper =
    group.maxSelect === group.minSelect && group.minSelect > 1
      ? t("chooseExactly", { count: group.minSelect })
      : group.maxSelect > 1
        ? t("chooseUpTo", { count: group.maxSelect })
        : t("chooseOne");

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
        {group.name}
        {group.isRequired && (
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-dark">
            {t("required")}
          </span>
        )}
      </legend>
      <p className="mb-1 text-xs text-zinc-400">
        {helper} ({selectedCount}/{group.maxSelect})
      </p>
      <div className="space-y-2">
        {group.extras
          .filter((extra) => extra.isActive)
          .map((extra) => {
            const checked = selectedExtraIds.has(extra.id);
            const disabled = !checked && atMax;
            return (
              <label
                key={extra.id}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                  checked ? "border-ink bg-zinc-50" : "border-zinc-200"
                } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-zinc-300"}`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(extra.id)}
                    className="accent-gold"
                  />
                  {extra.name}
                </span>
                {extra.priceModifier !== 0 && (
                  <span className="text-zinc-500">
                    +{formatPrice(extra.priceModifier)}
                  </span>
                )}
              </label>
            );
          })}
      </div>
    </fieldset>
  );
}
