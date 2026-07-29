export interface DashboardStats {
  periodOrderCount: number;
  periodRevenue: number;
  pendingOrderCount: number;
  ordersByStatus: { status: string; count: number }[];
  totalProducts: number;
  totalCategories: number;
}
