"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";

export function CartIcon() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const { data: cart } = useCart(locale);
  const count = cart?.itemCount ?? 0;

  return (
    <Link href="/cart" aria-label={t("cart")} className="relative flex items-center justify-center p-2 text-ink">
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
