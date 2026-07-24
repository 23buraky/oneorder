"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-profile";
import { ApiError } from "@/lib/api/base";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  marketingOptIn: boolean;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

export default function AccountProfilePage() {
  const t = useTranslations("account.profile");
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? "",
        marketingOptIn: profile.marketingOptIn,
      });
    }
  }, [profile, reset]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>();

  const [saved, setSaved] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const onSubmitProfile = async (values: ProfileFormValues) => {
    await updateProfile.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
      marketingOptIn: values.marketingOptIn,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    await changePassword.mutateAsync(values);
    setPasswordChanged(true);
    resetPassword();
    setTimeout(() => setPasswordChanged(false), 2500);
  };

  if (isLoading || !profile) {
    return <p className="text-sm text-zinc-500">...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-ink">{t("title")}</h1>

        <form onSubmit={handleSubmit(onSubmitProfile)} className="max-w-md space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">{t("firstNameLabel")}</label>
              <input
                {...register("firstName")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">{t("lastNameLabel")}</label>
              <input
                {...register("lastName")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">{t("emailLabel")}</label>
            <input
              value={profile.email}
              disabled
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">{t("phoneLabel")}</label>
            <input
              {...register("phone")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input type="checkbox" {...register("marketingOptIn")} className="accent-gold" />
            {t("marketingOptIn")}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>

          {saved && <p className="text-sm font-semibold text-emerald-700">{t("saved")}</p>}
          {updateProfile.error && (
            <p className="text-sm text-red-600">
              {updateProfile.error instanceof ApiError ? updateProfile.error.message : t("genericError")}
            </p>
          )}
        </form>
      </div>

      <div className="max-w-md border-t border-zinc-200 pt-6">
        <h2 className="mb-4 text-lg font-bold text-ink">{t("passwordHeading")}</h2>

        {profile.authProvider !== "LOCAL" ? (
          <p className="text-sm text-zinc-500">{t("oauthNotice")}</p>
        ) : (
          <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-3" noValidate>
            <input
              type="password"
              placeholder={t("currentPasswordLabel")}
              {...registerPassword("currentPassword")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              type="password"
              placeholder={t("newPasswordLabel")}
              {...registerPassword("newPassword")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:opacity-50"
            >
              {t("changePassword")}
            </button>
            {passwordChanged && <p className="text-sm font-semibold text-emerald-700">{t("passwordChanged")}</p>}
            {changePassword.error && (
              <p className="text-sm text-red-600">
                {changePassword.error instanceof ApiError ? changePassword.error.message : t("genericError")}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
