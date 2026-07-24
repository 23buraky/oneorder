import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-1">
          <span className="text-lg font-extrabold tracking-[0.2em] text-ink">ONE ORDER</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
            One kitchen. Endless choices.
          </span>
        </Link>
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
