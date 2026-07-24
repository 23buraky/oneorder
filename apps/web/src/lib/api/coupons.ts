import { apiRequest } from "./base";

export interface CouponApplication {
  couponId: string;
  code: string;
  discountAmount: number;
  freeDelivery: boolean;
}

export function validateCoupon(code: string, subtotal: number): Promise<CouponApplication> {
  return apiRequest<CouponApplication>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  isActive: boolean;
}

export interface CouponInput {
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive?: boolean;
}

export function listCoupons(accessToken: string): Promise<Coupon[]> {
  return apiRequest<Coupon[]>("/coupons", { accessToken });
}

export function createCoupon(input: CouponInput, accessToken: string): Promise<Coupon> {
  return apiRequest<Coupon>("/coupons", { method: "POST", body: JSON.stringify(input), accessToken });
}

export function updateCoupon(id: string, input: Partial<CouponInput>, accessToken: string): Promise<Coupon> {
  return apiRequest<Coupon>(`/coupons/${id}`, { method: "PATCH", body: JSON.stringify(input), accessToken });
}

export function deleteCoupon(id: string, accessToken: string): Promise<void> {
  return apiRequest<void>(`/coupons/${id}`, { method: "DELETE", accessToken });
}
