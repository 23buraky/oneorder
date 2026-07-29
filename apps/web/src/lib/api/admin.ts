import { apiRequest } from "./base";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
  customerName: string;
  customerEmail: string | null;
}

export type DashboardPeriod = "TODAY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "ALL" | "CUSTOM";

export interface DashboardStats {
  periodOrderCount: number;
  periodRevenue: number;
  pendingOrderCount: number;
  ordersByStatus: { status: string; count: number }[];
  totalProducts: number;
  totalCategories: number;
}

export function getDashboardStats(
  accessToken: string,
  params: { period: DashboardPeriod; from?: string; to?: string },
): Promise<DashboardStats> {
  const query = new URLSearchParams({ period: params.period });
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return apiRequest<DashboardStats>(`/admin/dashboard?${query.toString()}`, { accessToken });
}

export function getRestaurantForceClosed(accessToken: string): Promise<{ forceClosed: boolean }> {
  return apiRequest("/opening-hours/manual-override", { accessToken });
}

export function setRestaurantForceClosed(forceClosed: boolean, accessToken: string): Promise<{ forceClosed: boolean }> {
  return apiRequest("/opening-hours/manual-override", {
    method: "PUT",
    body: JSON.stringify({ forceClosed }),
    accessToken,
  });
}

export interface AdminOrdersResult {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export function listAdminOrders(
  params: { status?: string; type?: string; page?: number; pageSize?: number },
  accessToken: string,
): Promise<AdminOrdersResult> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  return apiRequest<AdminOrdersResult>(`/admin/orders?${query.toString()}`, { accessToken });
}

export function updateOrderStatus(
  orderNumber: string,
  status: string,
  accessToken: string,
  note?: string,
): Promise<unknown> {
  return apiRequest(`/orders/${orderNumber}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
    accessToken,
  });
}
