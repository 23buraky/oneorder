export interface DashboardStats {
  todayOrderCount: number;
  todayRevenue: number;
  pendingOrderCount: number;
  ordersByStatus: { status: string; count: number }[];
  totalProducts: number;
  totalCategories: number;
}
