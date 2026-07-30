"use client";

import { useState } from "react";
import {
  useDashboardStats,
  useRestaurantOpenStatus,
  useRestaurantOverride,
  useSetRestaurantOverride,
} from "@/hooks/use-admin";
import { useRealtimeAdmin } from "@/hooks/use-realtime-admin";
import { formatPrice } from "@/lib/format";
import type { DashboardPeriod, RestaurantOverride } from "@/lib/api/admin";

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "TODAY", label: "Vandaag" },
  { value: "WEEKLY", label: "Deze week" },
  { value: "MONTHLY", label: "Deze maand" },
  { value: "YEARLY", label: "Dit jaar" },
  { value: "ALL", label: "Alles" },
  { value: "CUSTOM", label: "Periode kiezen" },
];

const OVERRIDE_OPTIONS: { value: RestaurantOverride; label: string }[] = [
  { value: "AUTO", label: "Automatisch" },
  { value: "OPEN", label: "Geforceerd open" },
  { value: "CLOSED", label: "Geforceerd dicht" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function RestaurantToggle() {
  const { data: overrideData, isLoading: isLoadingOverride } = useRestaurantOverride();
  const { data: statusData, isLoading: isLoadingStatus } = useRestaurantOpenStatus();
  const setOverride = useSetRestaurantOverride();

  const override = overrideData?.override ?? "AUTO";
  const isOpen = statusData?.isOpen ?? false;
  const isLoading = isLoadingOverride || isLoadingStatus;

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Restaurant status</p>
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold ${isOpen ? "text-green-600" : "text-red-500"}`}
        >
          <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
          {isLoading ? "..." : isOpen ? "Nu open — klanten kunnen bestellen" : "Nu dicht — bestellen uitgeschakeld"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {OVERRIDE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={setOverride.isPending}
            onClick={() => setOverride.mutate(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              override === option.value
                ? "bg-ink text-white"
                : "border border-zinc-300 text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        &quot;Automatisch&quot; volgt de ingestelde openingstijden. &quot;Geforceerd&quot; negeert de openingstijden
        volledig, ook buiten schema.
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("TODAY");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: stats, isLoading } = useDashboardStats({ period, from: from || undefined, to: to || undefined });
  const { lastNewOrder, clearLastNewOrder } = useRealtimeAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">Dashboard</h1>

      <RestaurantToggle />

      {lastNewOrder && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-gold bg-gold/10 px-4 py-3 text-sm">
          <span className="font-semibold text-ink">
            Nieuwe bestelling binnengekomen: {lastNewOrder.orderNumber} &middot; {formatPrice(lastNewOrder.total)}
          </span>
          <button
            type="button"
            onClick={clearLastNewOrder}
            className="text-xs font-semibold text-zinc-500 hover:text-ink"
          >
            Sluiten
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              period === option.value
                ? "bg-ink text-white"
                : "border border-zinc-300 text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {period === "CUSTOM" && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <span className="text-sm text-zinc-400">tot</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
      )}

      {isLoading || !stats ? (
        <p className="text-sm text-zinc-500">...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Bestellingen" value={stats.periodOrderCount} />
            <StatCard label="Omzet" value={formatPrice(stats.periodRevenue)} />
            <StatCard label="Openstaand" value={stats.pendingOrderCount} />
            <StatCard label="Producten" value={stats.totalProducts} />
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Orders per status</p>
            <ul className="space-y-2">
              {stats.ordersByStatus.map((entry) => (
                <li key={entry.status} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{entry.status}</span>
                  <span className="font-semibold text-ink">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
