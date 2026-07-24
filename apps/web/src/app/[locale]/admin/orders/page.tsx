"use client";

import { useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/use-admin";
import { useRealtimeAdmin } from "@/hooks/use-realtime-admin";
import { formatPrice } from "@/lib/format";

const STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminOrders({ status: statusFilter || undefined, pageSize: 50 });
  const updateStatus = useUpdateOrderStatus();
  useRealtimeAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Bestellingen</h1>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">Alle statussen</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      <table className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Order</th>
            <th className="px-4 py-2">Klant</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Totaal</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((order) => (
            <tr key={order.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2">
                <p className="font-semibold text-ink">{order.orderNumber}</p>
                <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString()}</p>
              </td>
              <td className="px-4 py-2 text-zinc-600">
                <p>{order.customerName}</p>
                <p className="text-xs text-zinc-400">{order.customerEmail}</p>
              </td>
              <td className="px-4 py-2 text-zinc-600">{order.type}</td>
              <td className="px-4 py-2 font-semibold text-ink">{formatPrice(order.total)}</td>
              <td className="px-4 py-2">
                <select
                  value={order.status}
                  onChange={(event) =>
                    updateStatus.mutate({ orderNumber: order.orderNumber, status: event.target.value })
                  }
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-gold"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && data.items.length === 0 && <p className="mt-4 text-sm text-zinc-500">Geen bestellingen gevonden.</p>}
    </div>
  );
}
