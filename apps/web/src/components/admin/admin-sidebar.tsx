"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Bestellingen" },
  { href: "/admin/products", label: "Producten" },
  { href: "/admin/categories", label: "Categorieën" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/employees", label: "Medewerkers" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-zinc-800 bg-ink text-white">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-sm font-extrabold tracking-[0.15em]">ONE ORDER</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
