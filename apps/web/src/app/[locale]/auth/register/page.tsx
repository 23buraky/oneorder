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
import { apiRegister, ApiError } from "@/lib/api-client";

const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, "must contain a letter and a number"),
  marketingOptIn: z.boolean().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const result = await apiRegister(values);

      // Immediately adopt the tokens the API already issued, so the user
      // lands signed in — no need to log in again right after registering.
      await signIn("oauth-token-exchange", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        redirect: false,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2500);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t("genericError"));
    }
  };

  if (success) {
    return (
      <AuthCard title={t("title")}>
        <p className="text-sm text-emerald-700">{t("success")}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="firstName"
            label={t("firstNameLabel")}
            autoComplete="given-name"
            error={errors.firstName && "invalid"}
            {...register("firstName")}
          />
          <FormField
            id="lastName"
            label={t("lastNameLabel")}
            autoComplete="family-name"
            error={errors.lastName && "invalid"}
            {...register("lastName")}
          />
        </div>
        <FormField
          id="email"
          type="email"
          label={t("emailLabel")}
          autoComplete="email"
          error={errors.email && "invalid"}
          {...register("email")}
        />
        <div>
          <FormField
            id="password"
            type="password"
            label={t("passwordLabel")}
            autoComplete="new-password"
            error={errors.password && "invalid"}
            {...register("password")}
          />
          <p className="mt-1 text-xs text-zinc-400">{t("passwordHint")}</p>
        </div>

        <label className="flex items-start gap-2 text-xs text-zinc-500">
          <input type="checkbox" className="mt-0.5" {...register("marketingOptIn")} />
          {t("marketingOptIn")}
        </label>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <SubmitButton disabled={isSubmitting}>{isSubmitting ? t("submitting") : t("submit")}</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("haveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-ink hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
