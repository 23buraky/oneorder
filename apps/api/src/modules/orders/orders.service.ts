import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Locale, Order, OrderItem, OrderItemExtra, OrderStatus, OrderType, Prisma } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CartService, type CartWithItems } from "../cart/cart.service";
import type { CartIdentity } from "../cart/types/cart-view.type";
import { PricingService } from "../pricing/pricing.service";
import type { PricedLine } from "../pricing/types/priced-line.type";
import { roundToCents } from "../pricing/utils/money.util";
import { DeliveryZonesService } from "../delivery-zones/delivery-zones.service";
import { OpeningHoursService } from "../opening-hours/opening-hours.service";
import { CouponsService } from "../coupons/coupons.service";
import { LoyaltyService } from "../loyalty/loyalty.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CheckoutDto } from "./dto/checkout.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import type {
  AdminOrderListFilters,
  AdminOrderListItem,
  OrderAddressView,
  OrderListItem,
  OrderView,
} from "./types/order-view.type";

type OrderWithItems = Order & { items: (OrderItem & { extras: OrderItemExtra[] })[] };
type PricedCartLine = { cartItem: CartWithItems["items"][number]; priced: PricedLine };

const MAX_ORDER_NUMBER_ATTEMPTS = 5;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly pricingService: PricingService,
    private readonly deliveryZonesService: DeliveryZonesService,
    private readonly openingHoursService: OpeningHoursService,
    private readonly couponsService: CouponsService,
    private readonly loyaltyService: LoyaltyService,
    private readonly notificationsService: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async checkout(
    identity: CartIdentity,
    dto: CheckoutDto,
    locale: Locale,
  ): Promise<{ order: OrderView; newGuestToken: string | null }> {
    if (!identity.userId && (!dto.guestEmail || !dto.guestPhone)) {
      throw new BadRequestException("Guest checkout requires an email address and phone number");
    }

    const openStatus = await this.openingHoursService.isOpenNow();
    if (!openStatus.isOpen) {
      throw new BadRequestException(`We are currently closed${openStatus.reason ? `: ${openStatus.reason}` : ""}`);
    }

    const resolvedCart = await this.cartService.resolveCart(identity);
    if (resolvedCart.cart.items.length === 0) {
      throw new BadRequestException("Your cart is empty");
    }

    const lines = await Promise.all(
      resolvedCart.cart.items.map(async (cartItem) => ({
        cartItem,
        priced: await this.pricingService.priceLine({
          productId: cartItem.productId,
          variantId: cartItem.selectedVariantId ?? undefined,
          extraIds: cartItem.extras.map((extra) => extra.extraId),
          quantity: cartItem.quantity,
          locale,
        }),
      })),
    );

    const itemsTotal = roundToCents(lines.reduce((sum, line) => sum + line.priced.lineTotal, 0));
    const subtotal = roundToCents(lines.reduce((sum, line) => sum + line.priced.lineSubtotal, 0));
    const taxAmount = roundToCents(lines.reduce((sum, line) => sum + line.priced.lineVatAmount, 0));

    let deliveryFee = 0;
    let estimatedDeliveryMinutes: number | null = null;
    let address: OrderAddressView | null = null;

    if (dto.type === "DELIVERY") {
      address = await this.resolveDeliveryAddress(identity, dto);

      const zone = await this.deliveryZonesService.findZoneForPostalCode(address.postalCode);
      if (!zone) {
        throw new BadRequestException(`Sorry, we do not currently deliver to postal code "${address.postalCode}"`);
      }

      const minOrderAmount = zone.minOrderAmount.toNumber();
      if (itemsTotal < minOrderAmount) {
        throw new BadRequestException(`Minimum order amount for delivery to this area is €${minOrderAmount.toFixed(2)}`);
      }

      deliveryFee = zone.deliveryFee.toNumber();
      estimatedDeliveryMinutes = zone.estimatedDeliveryMinutes;
    }

    let discountAmount = 0;
    let couponId: string | null = null;

    if (dto.couponCode) {
      const application = await this.couponsService.validate(dto.couponCode, itemsTotal, identity.userId);
      couponId = application.couponId;
      discountAmount = application.discountAmount;
      if (application.freeDelivery) {
        deliveryFee = 0;
      }
    }

    const tip = roundToCents(dto.tip ?? 0);
    const total = roundToCents(Math.max(0, itemsTotal + deliveryFee - discountAmount + tip));

    const order = await this.createOrderWithRetry({
      identity,
      dto,
      locale,
      address,
      lines,
      subtotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      tip,
      total,
      couponId,
      estimatedDeliveryMinutes,
    });

    await this.cartService.emptyCart(resolvedCart.cart.id);

    void this.notificationsService.notifyOrderStatus(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        guestEmail: order.guestEmail,
        estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      },
      "PENDING",
    );
    this.realtimeGateway.emitOrderCreated({
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      total: order.total.toNumber(),
    });

    return { order: this.toView(order), newGuestToken: resolvedCart.newGuestToken };
  }

  async listForUser(userId: string): Promise<OrderListItem[]> {
    const orders = await this.prisma.client.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return orders.map((order) => this.toListItem(order));
  }

  async listAllForAdmin(
    filters: AdminOrderListFilters,
  ): Promise<{ items: AdminOrderListItem[]; total: number; page: number; pageSize: number }> {
    const where: Prisma.OrderWhereInput = {
      ...(filters.status ? { status: filters.status as OrderStatus } : {}),
      ...(filters.type ? { type: filters.type as OrderType } : {}),
    };

    const [orders, total] = await this.prisma.client.$transaction([
      this.prisma.client.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.client.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => ({
        ...this.toListItem(order),
        customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : "Guest",
        customerEmail: order.user?.email ?? order.guestEmail ?? null,
      })),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async findByOrderNumber(orderNumber: string, identity: CartIdentity, guestEmail?: string): Promise<OrderView> {
    const order = await this.prisma.client.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { extras: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderNumber}" not found`);
    }

    if (order.userId) {
      if (order.userId !== identity.userId) {
        throw new ForbiddenException("This order does not belong to you");
      }
    } else {
      // Order numbers are human-readable and sequential (ONE-2026-000123), not
      // secret tokens — a guest order also requires the email used at
      // checkout, so an order number alone can't be used to browse strangers'
      // orders (addresses, items, totals).
      if (!guestEmail || guestEmail.toLowerCase() !== order.guestEmail?.toLowerCase()) {
        throw new ForbiddenException("Provide the email address used for this order");
      }
    }

    return this.toView(order);
  }

  async updateStatus(orderNumber: string, dto: UpdateOrderStatusDto, changedByUserId: string): Promise<OrderView> {
    const order = await this.prisma.client.order.findUnique({ where: { orderNumber } });
    if (!order) {
      throw new NotFoundException(`Order "${orderNumber}" not found`);
    }

    const updated = await this.prisma.client.order.update({
      where: { id: order.id },
      data: {
        status: dto.status,
        readyAt: dto.status === "READY" ? new Date() : undefined,
        deliveredAt: dto.status === "DELIVERED" ? new Date() : undefined,
        cancelledAt: dto.status === "CANCELLED" ? new Date() : undefined,
        statusHistory: { create: { status: dto.status, changedByUserId, note: dto.note } },
      },
      include: { items: { include: { extras: true } } },
    });

    void this.notificationsService.notifyOrderStatus(
      {
        id: updated.id,
        orderNumber: updated.orderNumber,
        userId: updated.userId,
        guestEmail: updated.guestEmail,
        estimatedDeliveryMinutes: updated.estimatedDeliveryMinutes,
      },
      dto.status,
    );
    this.realtimeGateway.emitOrderStatusChanged({ orderNumber: updated.orderNumber, status: updated.status });

    return this.toView(updated);
  }

  private async resolveDeliveryAddress(identity: CartIdentity, dto: CheckoutDto): Promise<OrderAddressView> {
    if (dto.deliveryAddressId) {
      if (!identity.userId) {
        throw new BadRequestException("A saved address can only be used when logged in");
      }
      const address = await this.prisma.client.address.findFirst({
        where: { id: dto.deliveryAddressId, userId: identity.userId },
      });
      if (!address) {
        throw new NotFoundException("Address not found");
      }
      return {
        street: address.street,
        houseNumber: address.houseNumber,
        postalCode: address.postalCode,
        city: address.city,
      };
    }

    if (!dto.deliveryStreet || !dto.deliveryHouseNumber || !dto.deliveryPostalCode || !dto.deliveryCity) {
      throw new BadRequestException(
        "A delivery address is required: street, house number, postal code and city",
      );
    }

    return {
      street: dto.deliveryStreet,
      houseNumber: dto.deliveryHouseNumber,
      postalCode: dto.deliveryPostalCode,
      city: dto.deliveryCity,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const count = await this.prisma.client.order.count({ where: { createdAt: { gte: startOfYear } } });
    return `ONE-${year}-${String(count + 1).padStart(6, "0")}`;
  }

  private async createOrderWithRetry(params: {
    identity: CartIdentity;
    dto: CheckoutDto;
    locale: Locale;
    address: OrderAddressView | null;
    lines: PricedCartLine[];
    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    discountAmount: number;
    tip: number;
    total: number;
    couponId: string | null;
    estimatedDeliveryMinutes: number | null;
  }): Promise<OrderWithItems> {
    for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      const orderNumber = await this.generateOrderNumber();

      try {
        // eslint-disable-next-line no-await-in-loop
        return await this.prisma.client.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber,
              userId: params.identity.userId,
              guestEmail: params.identity.userId ? undefined : params.dto.guestEmail,
              guestPhone: params.identity.userId ? undefined : params.dto.guestPhone,
              type: params.dto.type,
              locale: params.locale,
              subtotal: params.subtotal,
              taxAmount: params.taxAmount,
              deliveryFee: params.deliveryFee,
              discountAmount: params.discountAmount,
              tip: params.tip,
              total: params.total,
              couponId: params.couponId,
              deliveryStreetSnapshot: params.address?.street,
              deliveryHouseNoSnapshot: params.address?.houseNumber,
              deliveryPostalSnapshot: params.address?.postalCode,
              deliveryCitySnapshot: params.address?.city,
              deliveryNote: params.dto.deliveryNote,
              estimatedDeliveryMinutes: params.estimatedDeliveryMinutes,
              items: {
                create: params.lines.map(({ priced }) => ({
                  productId: priced.productId,
                  productNameSnapshot: priced.productName,
                  quantity: priced.quantity,
                  unitPrice: priced.unitPrice,
                  vatCategorySnapshot: priced.vatCategory,
                  vatRateSnapshot: priced.vatRatePercentage,
                  lineSubtotal: priced.lineSubtotal,
                  lineVatAmount: priced.lineVatAmount,
                  lineTotal: priced.lineTotal,
                  selectedVariantId: priced.variantId,
                  variantNameSnapshot: priced.variantName,
                  variantPriceModifierSnapshot: priced.variantId ? priced.variantPriceModifier : null,
                  extras: {
                    create: priced.extras.map((extra) => ({
                      extraId: extra.id,
                      extraNameSnapshot: extra.name,
                      priceModifierSnapshot: extra.priceModifier,
                    })),
                  },
                })),
              },
              statusHistory: {
                create: { status: "PENDING", changedByUserId: params.identity.userId, note: "Order placed" },
              },
            },
            include: { items: { include: { extras: true } } },
          });

          if (params.couponId) {
            await tx.couponRedemption.create({
              data: { couponId: params.couponId, userId: params.identity.userId, orderId: order.id },
            });
          }

          // Guests have no account to credit points to.
          if (params.identity.userId) {
            await this.loyaltyService.awardPointsForOrder(tx, params.identity.userId, order.id, params.total);
          }

          // Best-effort stock decrement — no reservation/locking, so under
          // heavy concurrent load stock can dip below zero. Acceptable for
          // now; revisit once real order volume justifies proper reservations.
          for (const { priced } of params.lines) {
            // eslint-disable-next-line no-await-in-loop
            await tx.product.updateMany({
              where: { id: priced.productId, stock: { not: null } },
              data: { stock: { decrement: priced.quantity } },
            });
          }

          return order;
        });
      } catch (error) {
        const isDuplicateOrderNumber =
          typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
        if (isDuplicateOrderNumber && attempt < MAX_ORDER_NUMBER_ATTEMPTS - 1) {
          continue;
        }
        throw error;
      }
    }

    throw new Error("Failed to generate a unique order number");
  }

  private toListItem(order: Order & { items: OrderItem[] }): OrderListItem {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      paymentStatus: order.paymentStatus,
      total: order.total.toNumber(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    };
  }

  private toView(order: OrderWithItems): OrderView {
    const hasAddress = Boolean(order.deliveryStreetSnapshot && order.deliveryPostalSnapshot);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      deliveryFee: order.deliveryFee.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      tip: order.tip.toNumber(),
      total: order.total.toNumber(),
      deliveryAddress: hasAddress
        ? {
            street: order.deliveryStreetSnapshot as string,
            houseNumber: order.deliveryHouseNoSnapshot as string,
            postalCode: order.deliveryPostalSnapshot as string,
            city: order.deliveryCitySnapshot as string,
          }
        : null,
      deliveryNote: order.deliveryNote,
      estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        variantName: item.variantNameSnapshot,
        extras: item.extras.map((extra) => ({
          name: extra.extraNameSnapshot,
          priceModifier: extra.priceModifierSnapshot.toNumber(),
        })),
        lineSubtotal: item.lineSubtotal.toNumber(),
        lineVatAmount: item.lineVatAmount.toNumber(),
        lineTotal: item.lineTotal.toNumber(),
      })),
      createdAt: order.createdAt,
    };
  }
}
