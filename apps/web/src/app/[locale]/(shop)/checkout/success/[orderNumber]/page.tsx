"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useOrder } from "@/hooks/use-checkout";
import { useRealtimeOrder } from "@/hooks/use-realtime-order";
import { formatPrice } from "@/lib/format";

// useSearchParams() requires a Suspense boundary so `next build` can still
// prerender a static shell around this dynamic segment.
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const t = useTranslations("orderConfirmation");
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState("");
  const [guestEmail, setGuestEmail] = useState(searchParams.get("guestEmail") ?? "");

  const { data: order, isError, isLoading } = useOrder(params.orderNumber, guestEmail || undefined);
  useRealtimeOrder(order ? params.orderNumber : undefined, guestEmail || undefined);

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-zinc-500">...</div>;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="mb-4 text-center text-sm text-zinc-500">{t("provideEmail")}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setGuestEmail(emailInput);
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder={t("emailLabel")}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            {t("view")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t("title")}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">{order.orderNumber}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {t("status")}: <span className="font-semibold text-ink">{order.status}</span>
        </p>
        {order.estimatedDeliveryMinutes && (
          <p className="text-sm text-zinc-500">
            {t("estimatedDelivery")}: {order.estimatedDeliveryMinutes} {t("minutes")}
          </p>
        )}
      </div>

      <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 p-4 text-sm">
            <span>
              {item.quantity}&times; {item.productName}
              {item.variantName ? ` (${item.variantName})` : ""}
              {item.extras.length > 0 && (
                <span className="block text-xs text-zinc-500">
                  {item.extras.map((extra) => extra.name).join(", ")}
                </span>
              )}
            </span>
            <span className="font-semibold text-ink">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-zinc-500">
          <span>{t("orderNumber")}</span>
          <span>{order.orderNumber}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-zinc-500">
            <span>{t("deliveryFee")}</span>
            <span>{formatPrice(order.deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-ink">
          <span>{t("total")}</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link
        href="/menu"
        className="mt-6 block text-center text-sm font-semibold text-ink hover:underline"
      >
        {t("backToMenu")}
      </Link>
    </div>
  );
}
