"use client";

import { useDashboardStats } from "@/hooks/use-admin";
import { useRealtimeAdmin } from "@/hooks/use-realtime-admin";
import { formatPrice } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { lastNewOrder, clearLastNewOrder } = useRealtimeAdmin();

  if (isLoading || !stats) {
    return <p className="text-sm text-zinc-500">...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">Dashboard</h1>

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Bestellingen vandaag" value={stats.todayOrderCount} />
        <StatCard label="Omzet vandaag" value={formatPrice(stats.todayRevenue)} />
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
    </div>
  );
}
