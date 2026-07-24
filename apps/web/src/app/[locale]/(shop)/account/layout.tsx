"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-zinc-500">...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 sm:flex-row">
        <AccountSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
