"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { apiVerifyEmail } from "@/lib/api-client";

type Status = "verifying" | "success" | "error";

// useSearchParams() requires a Suspense boundary so `next build` can still
// prerender a static shell around this dynamic segment.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiVerifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthCard title={t("title")}>
      {status === "verifying" && <p className="text-sm text-zinc-500">{t("verifying")}</p>}
      {status === "success" && <p className="text-sm text-emerald-700">{t("success")}</p>}
      {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}

      {status !== "verifying" && (
        <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-ink hover:underline">
          {t("loginLink")}
        </Link>
      )}
    </AuthCard>
  );
}
