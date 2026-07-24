import { apiRequest } from "./base";
import { toApiLocale } from "./locale";

export interface OrderItemExtraView {
  name: string;
  priceModifier: number;
}

export interface OrderItemView {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  variantName: string | null;
  extras: OrderItemExtraView[];
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
}

export interface OrderAddressView {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  tip: number;
  total: number;
  deliveryAddress: OrderAddressView | null;
  deliveryNote: string | null;
  estimatedDeliveryMinutes: number | null;
  items: OrderItemView[];
  createdAt: string;
}

export interface CheckoutInput {
  type: "DELIVERY" | "PICKUP";
  guestEmail?: string;
  guestPhone?: string;
  deliveryStreet?: string;
  deliveryHouseNumber?: string;
  deliveryBox?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  deliveryNote?: string;
  couponCode?: string;
  tip?: number;
}

export function checkout(input: CheckoutInput, locale: string, accessToken?: string): Promise<OrderView> {
  return apiRequest<OrderView>(`/orders?locale=${toApiLocale(locale)}`, {
    method: "POST",
    body: JSON.stringify(input),
    accessToken,
  });
}

export function getOrder(orderNumber: string, guestEmail?: string, accessToken?: string): Promise<OrderView> {
  const query = guestEmail ? `?guestEmail=${encodeURIComponent(guestEmail)}` : "";
  return apiRequest<OrderView>(`/orders/${orderNumber}${query}`, { accessToken });
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export function listMyOrders(accessToken: string): Promise<OrderListItem[]> {
  return apiRequest<OrderListItem[]>("/orders", { accessToken });
}
