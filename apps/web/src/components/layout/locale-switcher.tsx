"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = { nl: "NL", en: "EN", fr: "FR", tr: "TR" };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => router.replace(pathname, { locale: event.target.value })}
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-gold"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code] ?? code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
