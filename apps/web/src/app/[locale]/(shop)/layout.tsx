import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Route group (parentheses = excluded from the URL) so the customer-facing
// chrome (header/footer) doesn't leak into /auth or the future /admin panel,
// which get their own layouts.
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
