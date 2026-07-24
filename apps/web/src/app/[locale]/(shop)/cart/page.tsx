"use client";

import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart, useRemoveCartItem, useUpdateCartItemQuantity } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { data: cart, isLoading } = useCart(locale);
  const updateQuantity = useUpdateCartItemQuantity(locale);
  const removeItem = useRemoveCartItem(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold text-ink">{t("title")}</h1>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {cart && cart.items.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">{t("empty")}</p>
          <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
            {t("continueShopping")}
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {cart.items.map((item) => (
              <li key={item.cartItemId} className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{item.productName}</p>
                  {item.variantName && <p className="text-xs text-zinc-500">{item.variantName}</p>}
                  {item.extras.length > 0 && (
                    <p className="text-xs text-zinc-500">{item.extras.map((extra) => extra.name).join(", ")}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-zinc-300 px-2 py-1 w-fit">
                    <button
                      type="button"
                      aria-label="-"
                      onClick={() =>
                        updateQuantity.mutate({ itemId: item.cartItemId, quantity: Math.max(1, item.quantity - 1) })
                      }
                      className="flex h-5 w-5 items-center justify-center text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="+"
                      onClick={() =>
                        updateQuantity.mutate({ itemId: item.cartItemId, quantity: item.quantity + 1 })
                      }
                      className="flex h-5 w-5 items-center justify-center text-ink"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-ink">{formatPrice(item.lineTotal)}</span>
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() => removeItem.mutate(item.cartItemId)}
                    className="text-zinc-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>{t("vat")}</span>
              <span>{formatPrice(cart.vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-ink">
              <span>{t("total")}</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-md bg-ink px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {t("checkoutCta")}
          </Link>
        </>
      )}
    </div>
  );
}
