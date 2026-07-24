import { Injectable, Logger } from "@nestjs/common";
import type { NotificationType, OrderStatus } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { MailService } from "../auth/mail/mail.service";

const STATUS_NOTIFICATION_TYPE: Partial<Record<OrderStatus, NotificationType>> = {
  PENDING: "ORDER_RECEIVED",
  ACCEPTED: "ORDER_ACCEPTED",
  PREPARING: "ORDER_PREPARING",
  READY: "ORDER_READY",
  OUT_FOR_DELIVERY: "ORDER_ON_THE_WAY",
  DELIVERED: "ORDER_DELIVERED",
  CANCELLED: "ORDER_CANCELLED",
};

const STATUS_TITLE: Partial<Record<OrderStatus, string>> = {
  PENDING: "Bestelling ontvangen",
  ACCEPTED: "Bestelling bevestigd",
  PREPARING: "Bestelling wordt bereid",
  READY: "Bestelling is klaar",
  OUT_FOR_DELIVERY: "Bestelling is onderweg",
  DELIVERED: "Bestelling geleverd",
  CANCELLED: "Bestelling geannuleerd",
};

interface OrderForNotification {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  estimatedDeliveryMinutes: number | null;
}

// Notifies a customer about an order status change: sends the transactional
// email and writes a NotificationLog row (SMS/PUSH channels are modeled in
// the schema for later — no provider is wired up yet, so only EMAIL sends).
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async notifyOrderStatus(order: OrderForNotification, status: OrderStatus): Promise<void> {
    const type = STATUS_NOTIFICATION_TYPE[status];
    if (!type) return; // e.g. REFUNDED — no customer-facing email defined yet

    const recipientEmail = await this.resolveRecipientEmail(order);
    if (!recipientEmail) return;

    const title = STATUS_TITLE[status] ?? status;

    try {
      await this.mail.sendOrderStatusEmail(
        recipientEmail,
        order.orderNumber,
        status as "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED",
        order.estimatedDeliveryMinutes,
      );

      await this.prisma.client.notificationLog.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type,
          channel: "EMAIL",
          title,
          body: `Bestelling ${order.orderNumber}: ${title.toLowerCase()}`,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      // A failed notification should never roll back or block the order
      // status change itself — log and move on.
      this.logger.error(`Failed to notify order ${order.orderNumber} (${status})`, error as Error);
    }
  }

  private async resolveRecipientEmail(order: OrderForNotification): Promise<string | null> {
    if (order.guestEmail) return order.guestEmail;
    if (!order.userId) return null;

    const user = await this.prisma.client.user.findUnique({
      where: { id: order.userId },
      select: { email: true },
    });
    return user?.email ?? null;
  }
}
