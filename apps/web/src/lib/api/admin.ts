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

export interface DashboardStats {
  todayOrderCount: number;
  todayRevenue: number;
  pendingOrderCount: number;
  ordersByStatus: { status: string; count: number }[];
  totalProducts: number;
  totalCategories: number;
}

export function getDashboardStats(accessToken: string): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/admin/dashboard", { accessToken });
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
