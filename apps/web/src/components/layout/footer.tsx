import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="border-t border-zinc-200 bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-sm font-extrabold tracking-[0.2em] text-white">ONE ORDER</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">{t("tagline")}</span>
          <p className="mt-4 text-xs text-zinc-400">
            ONE ORDER &middot; Antwerpen, Belgi&euml;
          </p>
          <nav className="mt-2 flex gap-4 text-xs text-zinc-400">
            <Link href="/menu" className="hover:text-white">
              Menu
            </Link>
          </nav>
          <p className="mt-6 text-[11px] text-zinc-500">
            &copy; {new Date().getFullYear()} ONE ORDER. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
