import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import type { DashboardStats } from "./types/dashboard-stats.type";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrderCount, statusGroups, totalProducts, totalCategories] = await Promise.all([
      this.prisma.client.order.findMany({
        where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
        select: { total: true },
      }),
      this.prisma.client.order.count({ where: { status: "PENDING" } }),
      this.prisma.client.order.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.client.product.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.client.category.count({ where: { deletedAt: null, isActive: true } }),
    ]);

    return {
      todayOrderCount: todayOrders.length,
      todayRevenue: Math.round(todayOrders.reduce((sum, order) => sum + order.total.toNumber(), 0) * 100) / 100,
      pendingOrderCount,
      ordersByStatus: statusGroups.map((group) => ({ status: group.status, count: group._count._all })),
      totalProducts,
      totalCategories,
    };
  }
}
