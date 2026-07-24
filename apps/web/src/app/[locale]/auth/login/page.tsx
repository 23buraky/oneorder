"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setServerError(t("genericError"));
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="email"
          type="email"
          label={t("emailLabel")}
          autoComplete="email"
          error={errors.email && "invalid"}
          {...register("email")}
        />
        <FormField
          id="password"
          type="password"
          label={t("passwordLabel")}
          autoComplete="current-password"
          error={errors.password && "required"}
          {...register("password")}
        />

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-ink">
            {t("forgotPassword")}
          </Link>
        </div>

        <SubmitButton disabled={isSubmitting}>{isSubmitting ? t("submitting") : t("submit")}</SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        {t("orContinueWith")}
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="font-semibold text-ink hover:underline">
          {t("registerLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
