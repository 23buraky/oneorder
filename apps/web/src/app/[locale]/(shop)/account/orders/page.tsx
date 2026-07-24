"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useMyOrders } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/format";

export default function AccountOrdersPage() {
  const t = useTranslations("account.orders");
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">{t("title")}</h1>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {orders && orders.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">{t("empty")}</p>
          <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-ink hover:underline">
            {t("browseMenu")}
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-ink">{order.orderNumber}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString()} &middot; {order.itemCount} items &middot;{" "}
                  {order.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">{formatPrice(order.total)}</span>
                <Link
                  href={`/checkout/success/${order.orderNumber}`}
                  className="text-xs font-semibold text-ink hover:underline"
                >
                  {t("view")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
