"use client";

import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";

const NAV_ITEMS = [
  { href: "/account", key: "profile" },
  { href: "/account/orders", key: "orders" },
  { href: "/account/addresses", key: "addresses" },
  { href: "/account/favorites", key: "favorites" },
  { href: "/account/loyalty", key: "loyalty" },
] as const;

export function AccountSidebar() {
  const t = useTranslations("account");
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 sm:w-48 sm:flex-col sm:overflow-visible sm:pb-0">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive ? "bg-ink text-white" : "text-ink hover:bg-zinc-100"
            }`}
          >
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-2 flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        {t("logout")}
      </button>
    </nav>
  );
}
