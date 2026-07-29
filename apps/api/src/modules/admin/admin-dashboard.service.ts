import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import type { DashboardStats } from "./types/dashboard-stats.type";
import { DashboardPeriod, type DashboardStatsQueryDto } from "./dto/dashboard-stats-query.dto";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Calendar-based ranges (start of this week/month/year), not rolling
  // windows — that matches how a restaurant owner actually thinks about
  // "this week's revenue" on a dashboard.
  private resolveRange(query: DashboardStatsQueryDto): { gte?: Date; lte?: Date } {
    const now = new Date();
    const period = query.period ?? DashboardPeriod.TODAY;

    switch (period) {
      case DashboardPeriod.TODAY: {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { gte: start };
      }
      case DashboardPeriod.WEEKLY: {
        const start = new Date(now);
        const daysSinceMonday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - daysSinceMonday);
        start.setHours(0, 0, 0, 0);
        return { gte: start };
      }
      case DashboardPeriod.MONTHLY: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { gte: start };
      }
      case DashboardPeriod.YEARLY: {
        const start = new Date(now.getFullYear(), 0, 1);
        return { gte: start };
      }
      case DashboardPeriod.ALL:
        return {};
      case DashboardPeriod.CUSTOM: {
        if (!query.from || !query.to) {
          throw new BadRequestException("from and to are required when period=CUSTOM");
        }
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        return { gte: new Date(query.from), lte: to };
      }
      default:
        return { gte: new Date(now.setHours(0, 0, 0, 0)) };
    }
  }

  async getStats(query: DashboardStatsQueryDto = {}): Promise<DashboardStats> {
    const range = this.resolveRange(query);
    const createdAt = { ...(range.gte && { gte: range.gte }), ...(range.lte && { lte: range.lte }) };

    const [periodOrders, pendingOrderCount, statusGroups, totalProducts, totalCategories] = await Promise.all([
      this.prisma.client.order.findMany({
        where: { createdAt, status: { not: "CANCELLED" } },
        select: { total: true },
      }),
      this.prisma.client.order.count({ where: { status: "PENDING" } }),
      this.prisma.client.order.groupBy({ by: ["status"], _count: { _all: true }, where: { createdAt } }),
      this.prisma.client.product.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.client.category.count({ where: { deletedAt: null, isActive: true } }),
    ]);

    return {
      periodOrderCount: periodOrders.length,
      periodRevenue: Math.round(periodOrders.reduce((sum, order) => sum + order.total.toNumber(), 0) * 100) / 100,
      pendingOrderCount,
      ordersByStatus: statusGroups.map((group) => ({ status: group.status, count: group._count._all })),
      totalProducts,
      totalCategories,
    };
  }
}
