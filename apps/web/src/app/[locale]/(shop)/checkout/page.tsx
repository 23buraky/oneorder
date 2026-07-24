"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { useCart } from "@/hooks/use-cart";
import { useCheckout, useValidateCoupon } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/base";
import type { CouponApplication } from "@/lib/api/coupons";

const baseSchema = z.object({
  type: z.enum(["DELIVERY", "PICKUP"]),
  guestEmail: z.string().optional(),
  guestPhone: z.string().optional(),
  deliveryStreet: z.string().optional(),
  deliveryHouseNumber: z.string().optional(),
  deliveryBox: z.string().optional(),
  deliveryPostalCode: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryNote: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof baseSchema>;

export default function CheckoutPage() {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const router = useRouter();
  const { data: session } = useSession();
  const isGuest = !session;

  const { data: cart, isLoading: cartLoading } = useCart(locale);
  const checkoutMutation = useCheckout(locale);
  const validateCouponMutation = useValidateCoupon();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponApplication | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [tip, setTip] = useState(0);

  const schema = useMemo(
    () =>
      baseSchema.superRefine((data, ctx) => {
        if (isGuest) {
          if (!data.guestEmail || !/^\S+@\S+\.\S+$/.test(data.guestEmail)) {
            ctx.addIssue({ path: ["guestEmail"], code: z.ZodIssueCode.custom, message: "invalid" });
          }
          if (!data.guestPhone) {
            ctx.addIssue({ path: ["guestPhone"], code: z.ZodIssueCode.custom, message: "required" });
          }
        }
        if (data.type === "DELIVERY") {
          if (!data.deliveryStreet) ctx.addIssue({ path: ["deliveryStreet"], code: z.ZodIssueCode.custom, message: "required" });
          if (!data.deliveryHouseNumber)
            ctx.addIssue({ path: ["deliveryHouseNumber"], code: z.ZodIssueCode.custom, message: "required" });
          if (!data.deliveryPostalCode)
            ctx.addIssue({ path: ["deliveryPostalCode"], code: z.ZodIssueCode.custom, message: "required" });
          if (!data.deliveryCity) ctx.addIssue({ path: ["deliveryCity"], code: z.ZodIssueCode.custom, message: "required" });
        }
      }),
    [isGuest],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "DELIVERY" },
  });

  const orderType = watch("type");

  const handleApplyCoupon = async () => {
    if (!couponCode || !cart) return;
    setCouponError(null);
    try {
      const application = await validateCouponMutation.mutateAsync({ code: couponCode, subtotal: cart.subtotal });
      setAppliedCoupon(application);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error instanceof ApiError ? error.message : t("couponInvalid"));
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      const order = await checkoutMutation.mutateAsync({
        type: values.type,
        guestEmail: isGuest ? values.guestEmail : undefined,
        guestPhone: isGuest ? values.guestPhone : undefined,
        deliveryStreet: values.type === "DELIVERY" ? values.deliveryStreet : undefined,
        deliveryHouseNumber: values.type === "DELIVERY" ? values.deliveryHouseNumber : undefined,
        deliveryBox: values.type === "DELIVERY" ? values.deliveryBox : undefined,
        deliveryPostalCode: values.type === "DELIVERY" ? values.deliveryPostalCode : undefined,
        deliveryCity: values.type === "DELIVERY" ? values.deliveryCity : undefined,
        deliveryNote: values.type === "DELIVERY" ? values.deliveryNote : undefined,
        couponCode: appliedCoupon?.code,
        tip: tip || undefined,
      });

      const guestEmailParam = isGuest && values.guestEmail ? `?guestEmail=${encodeURIComponent(values.guestEmail)}` : "";
      router.push(`/checkout/success/${order.orderNumber}${guestEmailParam}`);
    } catch {
      // checkoutMutation.error is rendered below
    }
  };

  if (cartLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-zinc-500">...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">{t("emptyCart")}</p>
        <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
          {t("backToMenu")}
        </Link>
      </div>
    );
  }

  const discount = appliedCoupon?.discountAmount ?? 0;
  // Delivery fee isn't known until the postal code is validated server-side
  // during checkout, so this total excludes it — the confirmation page shows
  // the real, final total once the order exists.
  const estimatedTotal = Math.max(0, cart.total - discount + tip);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold text-ink">{t("title")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 sm:grid-cols-[1.3fr_1fr]" noValidate>
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">{t("orderType")}</legend>
            <div className="flex gap-3">
              <label
                className={`flex-1 cursor-pointer rounded-md border px-4 py-3 text-center text-sm font-medium ${
                  orderType === "DELIVERY" ? "border-ink bg-zinc-50" : "border-zinc-200"
                }`}
              >
                <input type="radio" value="DELIVERY" {...register("type")} className="sr-only" />
                {t("delivery")}
              </label>
              <label
                className={`flex-1 cursor-pointer rounded-md border px-4 py-3 text-center text-sm font-medium ${
                  orderType === "PICKUP" ? "border-ink bg-zinc-50" : "border-zinc-200"
                }`}
              >
                <input type="radio" value="PICKUP" {...register("type")} className="sr-only" />
                {t("pickup")}
              </label>
            </div>
          </fieldset>

          {isGuest && (
            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-semibold text-ink">{t("contactHeading")}</legend>
              <div>
                <input
                  type="email"
                  placeholder={t("emailLabel")}
                  {...register("guestEmail")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                {errors.guestEmail && <p className="mt-1 text-xs text-red-600">{t("emailLabel")}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder={t("phoneLabel")}
                  {...register("guestPhone")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                {errors.guestPhone && <p className="mt-1 text-xs text-red-600">{t("phoneLabel")}</p>}
              </div>
            </fieldset>
          )}

          {orderType === "DELIVERY" && (
            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-semibold text-ink">{t("addressHeading")}</legend>
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder={t("streetLabel")}
                  {...register("deliveryStreet")}
                  className="col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <input
                  placeholder={t("houseNumberLabel")}
                  {...register("deliveryHouseNumber")}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>
              <input
                placeholder={t("boxLabel")}
                {...register("deliveryBox")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder={t("postalCodeLabel")}
                  {...register("deliveryPostalCode")}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <input
                  placeholder={t("cityLabel")}
                  {...register("deliveryCity")}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>
              {(errors.deliveryStreet || errors.deliveryHouseNumber || errors.deliveryPostalCode || errors.deliveryCity) && (
                <p className="text-xs text-red-600">{t("addressHeading")}</p>
              )}
              <textarea
                placeholder={t("noteLabel")}
                {...register("deliveryNote")}
                rows={2}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <p className="text-xs text-zinc-400">{t("deliveryFeeNote")}</p>
            </fieldset>
          )}
        </div>

        <div className="h-fit space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">{t("summaryHeading")}</h2>

          <ul className="space-y-1 text-sm text-zinc-600">
            {cart.items.map((item) => (
              <li key={item.cartItemId} className="flex justify-between gap-2">
                <span>
                  {item.quantity}&times; {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ""}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder={t("couponLabel")}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={validateCouponMutation.isPending}
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-semibold text-ink hover:bg-zinc-50"
            >
              {t("couponApply")}
            </button>
          </div>
          {appliedCoupon && <p className="text-xs font-semibold text-emerald-700">{t("couponApplied")}</p>}
          {couponError && <p className="text-xs text-red-600">{couponError}</p>}

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-500">{t("tipLabel")}</label>
            <div className="flex gap-2">
              {[0, 1, 2, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTip(value)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold ${
                    tip === value ? "border-ink bg-ink text-white" : "border-zinc-300 text-ink"
                  }`}
                >
                  {value === 0 ? "-" : formatPrice(value)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 border-t border-zinc-200 pt-3 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>{t("vat")}</span>
              <span>{formatPrice(cart.vatAmount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t("discount")}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-ink">
              <span>{t("total")}</span>
              <span>{formatPrice(estimatedTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || checkoutMutation.isPending}
            className="w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutMutation.isPending ? t("submitting") : t("submit")}
          </button>

          {checkoutMutation.error && (
            <p className="text-sm text-red-600">
              {checkoutMutation.error instanceof ApiError ? checkoutMutation.error.message : t("genericError")}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
