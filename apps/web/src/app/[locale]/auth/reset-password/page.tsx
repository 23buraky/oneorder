"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { apiResetPassword, ApiError } from "@/lib/api-client";

const schema = z.object({
  newPassword: z
    .string()
    .min(8)
    .max(72)
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, "must contain a letter and a number"),
});
type FormValues = z.infer<typeof schema>;

// useSearchParams() requires a Suspense boundary so `next build` can still
// prerender a static shell around this dynamic segment.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    setServerError(null);

    try {
      await apiResetPassword(token, values.newPassword);
      setSuccess(true);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("genericError"));
    }
  };

  if (!token) {
    return (
      <AuthCard title={t("title")}>
        <p className="text-sm text-red-600">{t("invalidToken")}</p>
        <Link href="/auth/forgot-password" className="mt-6 block text-center text-sm font-semibold text-ink hover:underline">
          {t("loginLink")}
        </Link>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard title={t("title")}>
        <p className="text-sm text-emerald-700">{t("success")}</p>
        <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-ink hover:underline">
          {t("loginLink")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          id="newPassword"
          type="password"
          label={t("passwordLabel")}
          autoComplete="new-password"
          error={errors.newPassword && "invalid"}
          {...register("newPassword")}
        />
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <SubmitButton disabled={isSubmitting}>{isSubmitting ? t("submitting") : t("submit")}</SubmitButton>
      </form>
    </AuthCard>
  );
}
