import { Injectable } from "@nestjs/common";
import type { Prisma } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import type { LoyaltySummary, LoyaltyTransactionView } from "./types/loyalty-summary.type";

const DEFAULT_POINTS_PER_EURO = 1;

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyLoyalty(userId: string): Promise<LoyaltySummary> {
    const user = await this.prisma.client.user.findUniqueOrThrow({ where: { id: userId } });
    const levels = await this.prisma.client.loyaltyLevelConfig.findMany({ orderBy: { minPointsRequired: "asc" } });

    const currentIndex = levels.findIndex((level) => level.level === user.loyaltyLevel);
    const next = currentIndex >= 0 && currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

    return {
      points: user.loyaltyPoints,
      level: user.loyaltyLevel,
      levels: levels.map((level) => ({
        level: level.level,
        minPointsRequired: level.minPointsRequired,
        freeDelivery: level.freeDelivery,
        perksDescription: level.perksDescription,
      })),
      nextLevel: next
        ? { level: next.level, pointsNeeded: Math.max(0, next.minPointsRequired - user.loyaltyPoints) }
        : null,
    };
  }

  async getTransactions(userId: string): Promise<LoyaltyTransactionView[]> {
    const transactions = await this.prisma.client.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      points: transaction.points,
      type: transaction.type,
      reason: transaction.reason,
      orderId: transaction.orderId,
      createdAt: transaction.createdAt,
    }));
  }

  // Called from inside OrdersService's checkout transaction so points are
  // awarded exactly once per successfully-created order, atomically with it.
  async awardPointsForOrder(
    tx: Prisma.TransactionClient,
    userId: string,
    orderId: string,
    orderTotal: number,
  ): Promise<void> {
    const setting = await tx.setting.findUnique({ where: { key: "loyalty_points_per_euro" } });
    const pointsPerEuro = setting ? Number(setting.value) : DEFAULT_POINTS_PER_EURO;
    const pointsEarned = Math.round(orderTotal * pointsPerEuro);

    if (pointsEarned <= 0) return;

    const user = await tx.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: pointsEarned } },
    });

    await tx.loyaltyTransaction.create({
      data: { userId, orderId, points: pointsEarned, type: "EARNED", reason: "Order placed" },
    });

    const levels = await tx.loyaltyLevelConfig.findMany({ orderBy: { minPointsRequired: "desc" } });
    const newLevel = levels.find((level) => user.loyaltyPoints >= level.minPointsRequired);

    if (newLevel && newLevel.level !== user.loyaltyLevel) {
      await tx.user.update({ where: { id: userId }, data: { loyaltyLevel: newLevel.level } });
    }
  }
}
