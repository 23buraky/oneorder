"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Deliberately outside the (shop) route group — the admin panel gets its own
// chrome, not the customer header/footer, and this layout also gates the
// entire /admin subtree to ADMIN (kitchen/staff get their own tools later).
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status !== "authenticated" || session.user.role !== "ADMIN") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">...</div>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu openen"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-extrabold tracking-[0.1em] text-ink">ONE ORDER — Admin</p>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
