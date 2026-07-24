"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@/hooks/use-admin-coupons";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/base";
import type { CouponInput } from "@/lib/api/coupons";

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<CouponInput>({
    defaultValues: { type: "PERCENTAGE", isActive: true, usageLimitPerUser: 1 },
  });

  const onSubmit = async (values: CouponInput) => {
    setError(null);
    try {
      await createCoupon.mutateAsync({
        ...values,
        value: Number(values.value),
        minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : undefined,
        maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : undefined,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
        usageLimitPerUser: values.usageLimitPerUser ? Number(values.usageLimitPerUser) : undefined,
      });
      setShowNew(false);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Opslaan mislukt.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Coupons</h1>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Nieuwe coupon
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 max-w-lg space-y-3 rounded-xl border border-zinc-200 bg-white p-4" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Code (bv. WELKOM10)"
              {...register("code")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <select
              {...register("type")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Vast bedrag</option>
              <option value="FREE_DELIVERY">Gratis bezorging</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Waarde"
              {...register("value")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Min. bestelbedrag (optioneel)"
              {...register("minOrderAmount")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Max. gebruik totaal (optioneel)"
              {...register("usageLimit")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              type="number"
              placeholder="Max. per klant"
              {...register("usageLimitPerUser")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
              Aanmaken
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50"
            >
              Annuleren
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      <table className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Code</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Waarde</th>
            <th className="px-4 py-2">Actief</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {coupons?.map((coupon) => (
            <tr key={coupon.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2 font-semibold text-ink">{coupon.code}</td>
              <td className="px-4 py-2 text-zinc-600">{coupon.type}</td>
              <td className="px-4 py-2 text-zinc-600">
                {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatPrice(coupon.value)}
              </td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => updateCoupon.mutate({ id: coupon.id, input: { isActive: !coupon.isActive } })}
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    coupon.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {coupon.isActive ? "Actief" : "Inactief"}
                </button>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => deleteCoupon.mutate(coupon.id)}
                  className="text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="inline h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
