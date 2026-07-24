"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Deliberately outside the (shop) route group — the admin panel gets its own
// chrome, not the customer header/footer, and this layout also gates the
// entire /admin subtree to ADMIN (kitchen/staff get their own tools later).
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
