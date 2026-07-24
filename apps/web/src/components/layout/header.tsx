"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { LocaleSwitcher } from "./locale-switcher";
import { CartIcon } from "./cart-icon";

export function Header() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-[0.15em] text-ink">ONE ORDER</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
            One kitchen. Endless choices.
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/menu"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink transition hover:bg-zinc-100"
          >
            {t("menu")}
          </Link>

          <LocaleSwitcher />

          <CartIcon />

          {status === "authenticated" && session ? (
            <Link
              href="/account"
              aria-label={t("account")}
              className="flex items-center justify-center rounded-md p-2 text-ink hover:bg-zinc-100"
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {t("login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
