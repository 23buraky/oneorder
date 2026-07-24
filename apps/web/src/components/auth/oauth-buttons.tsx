import { useTranslations } from "next-intl";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1`;

// These are plain links, not next-auth signIn() calls: Google/Apple OAuth is
// fully handled server-side by the NestJS API (see apps/api auth module), so
// the browser just needs to be sent there directly. The API redirects back
// to /auth/callback once it has issued tokens.
export function OAuthButtons() {
  const t = useTranslations("auth.login");

  return (
    <div className="space-y-2">
      <a
        href={`${API_BASE_URL}/auth/google`}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-zinc-50"
      >
        {t("google")}
      </a>
      <a
        href={`${API_BASE_URL}/auth/apple`}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-zinc-50"
      >
        {t("apple")}
      </a>
    </div>
  );
}
