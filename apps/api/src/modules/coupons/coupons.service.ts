import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Coupon } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { roundToCents } from "../pricing/utils/money.util";
import type { CouponApplication } from "./types/coupon-application.type";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.prisma.client.coupon.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`A coupon with code "${dto.code}" already exists`);
    }

    return this.prisma.client.coupon.create({
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        startsAt: dto.startsAt,
        expiresAt: dto.expiresAt,
        usageLimit: dto.usageLimit,
        usageLimitPerUser: dto.usageLimitPerUser ?? 1,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async list(): Promise<Coupon[]> {
    return this.prisma.client.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    await this.getOrThrow(id);

    if (dto.code) {
      const existing = await this.prisma.client.coupon.findUnique({ where: { code: dto.code } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`A coupon with code "${dto.code}" already exists`);
      }
    }

    return this.prisma.client.coupon.update({
      where: { id },
      data: {
        code: dto.code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        startsAt: dto.startsAt,
        expiresAt: dto.expiresAt,
        usageLimit: dto.usageLimit,
        usageLimitPerUser: dto.usageLimitPerUser,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.client.coupon.delete({ where: { id } });
  }

  private async getOrThrow(id: string): Promise<Coupon> {
    const coupon = await this.prisma.client.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id "${id}" not found`);
    }
    return coupon;
  }

  // Validates the coupon against every rule that doesn't require locking a
  // row (existence, dates, min order amount, usage limits) and computes the
  // discount it would apply. Actually recording the redemption happens in
  // OrdersService as part of the checkout transaction, once the order id exists.
  async validate(code: string, subtotal: number, userId: string | undefined): Promise<CouponApplication> {
    const coupon = await this.prisma.client.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException(`Coupon "${code}" not found`);
    }

    const now = new Date();
    if (now < coupon.startsAt) {
      throw new BadRequestException(`Coupon "${code}" is not active yet`);
    }
    if (coupon.expiresAt && now >= coupon.expiresAt) {
      throw new BadRequestException(`Coupon "${code}" has expired`);
    }

    const minOrderAmount = coupon.minOrderAmount?.toNumber() ?? 0;
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(`This coupon requires a minimum order of €${minOrderAmount.toFixed(2)}`);
    }

    if (coupon.usageLimit !== null) {
      const totalRedemptions = await this.prisma.client.couponRedemption.count({
        where: { couponId: coupon.id },
      });
      if (totalRedemptions >= coupon.usageLimit) {
        throw new BadRequestException(`Coupon "${code}" has reached its usage limit`);
      }
    }

    if (userId && coupon.usageLimitPerUser !== null) {
      const userRedemptions = await this.prisma.client.couponRedemption.count({
        where: { couponId: coupon.id, userId },
      });
      if (userRedemptions >= coupon.usageLimitPerUser) {
        throw new BadRequestException(`You have already used coupon "${code}" the maximum number of times`);
      }
    }

    return this.computeDiscount(coupon, subtotal);
  }

  private computeDiscount(coupon: Coupon, subtotal: number): CouponApplication {
    const value = coupon.value.toNumber();
    const maxDiscount = coupon.maxDiscountAmount?.toNumber();

    if (coupon.type === "FREE_DELIVERY") {
      return { couponId: coupon.id, code: coupon.code, discountAmount: 0, freeDelivery: true };
    }

    let discountAmount = coupon.type === "PERCENTAGE" ? (subtotal * value) / 100 : value;
    discountAmount = Math.min(discountAmount, subtotal);
    if (maxDiscount !== undefined) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount: roundToCents(discountAmount),
      freeDelivery: false,
    };
  }
}
