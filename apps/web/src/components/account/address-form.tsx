"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Address, AddressInput } from "@/lib/api/addresses";

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: Address;
  onSubmit: (values: AddressInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const t = useTranslations("account.addresses");
  const { register, handleSubmit } = useForm<AddressInput>({
    defaultValues: initial
      ? {
          label: initial.label,
          street: initial.street,
          houseNumber: initial.houseNumber,
          box: initial.box ?? "",
          postalCode: initial.postalCode,
          city: initial.city,
          deliveryNote: initial.deliveryNote ?? "",
          isDefault: initial.isDefault,
        }
      : { isDefault: false },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
      noValidate
    >
      <input
        placeholder={t("labelLabel")}
        {...register("label")}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder={t("streetLabel")}
          {...register("street")}
          className="col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          placeholder={t("houseNumberLabel")}
          {...register("houseNumber")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <input
        placeholder={t("boxLabel")}
        {...register("box")}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder={t("postalCodeLabel")}
          {...register("postalCode")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          placeholder={t("cityLabel")}
          {...register("city")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <textarea
        placeholder={t("noteLabel")}
        {...register("deliveryNote")}
        rows={2}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
      />
      <label className="flex items-center gap-2 text-xs text-zinc-500">
        <input type="checkbox" {...register("isDefault")} className="accent-gold" />
        {t("setDefault")}
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
