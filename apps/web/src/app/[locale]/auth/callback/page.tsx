"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";

// Landing page for the NestJS-driven Google/Apple OAuth flow. The API
// redirects here with `#accessToken=...&refreshToken=...` in the URL
// fragment (never the query string, so it never hits server logs). We read
// it once, exchange it for an Auth.js session, then scrub the fragment.
export default function OAuthCallbackPage() {
  const t = useTranslations("auth.callback");
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    history.replaceState(null, "", window.location.pathname);

    if (!accessToken || !refreshToken) {
      setFailed(true);
      return;
    }

    signIn("oauth-token-exchange", { accessToken, refreshToken, redirect: false }).then((result) => {
      if (!result || result.error) {
        setFailed(true);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }, [router]);

  return (
    <AuthCard title={t("title")}>
      {failed ? (
        <>
          <p className="text-sm text-red-600">{t("error")}</p>
          <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-ink hover:underline">
            {t("loginLink")}
          </Link>
        </>
      ) : (
        <p className="text-sm text-zinc-500">{t("title")}</p>
      )}
    </AuthCard>
  );
}
