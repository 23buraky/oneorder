import type { ReactNode } from "react";
import "../styles/globals.css";

// Next.js requires exactly one root layout with <html>/<body>. The actual
// per-locale <html lang> and i18n provider live in app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
