"use client";

import { signOut } from "next-auth/react";
import { LogOut, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Bestellingen" },
  { href: "/admin/products", label: "Producten" },
  { href: "/admin/categories", label: "Categorieën" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/employees", label: "Medewerkers" },
] as const;

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-56 shrink-0 flex-col border-r border-zinc-800 bg-ink text-white transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">
          <div>
            <p className="text-sm font-extrabold tracking-[0.15em]">ONE ORDER</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="rounded-md p-1 text-zinc-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 p-3">
          <Link href="/" className="mb-1 block rounded-md px-3 py-2 text-xs text-zinc-400 hover:text-white">
            &larr; Terug naar site
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Uitloggen
          </button>
        </div>
      </aside>
    </>
  );
}
