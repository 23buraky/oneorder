"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { apiForgotPassword } from "@/lib/api-client";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // The API always responds the same way regardless of whether the email
    // exists, to avoid leaking account existence — so there is no error path.
    await apiForgotPassword(values.email);
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthCard title={t("title")}>
        <p className="text-sm text-emerald-700">{t("success")}</p>
        <Link href="/auth/login" className="mt-6 block text-center text-sm font-semibold text-ink hover:underline">
          {t("backToLogin")}
        </Link>
      </AuthCard>
    );
  }

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
        <SubmitButton disabled={isSubmitting}>{isSubmitting ? t("submitting") : t("submit")}</SubmitButton>
      </form>

      <Link href="/auth/login" className="mt-6 block text-center text-sm text-zinc-500 hover:text-ink">
        {t("backToLogin")}
      </Link>
    </AuthCard>
  );
}
