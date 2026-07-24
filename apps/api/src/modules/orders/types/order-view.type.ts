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
  createdAt: Date;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: Date;
}

export interface AdminOrderListItem extends OrderListItem {
  customerName: string;
  customerEmail: string | null;
}

export interface AdminOrderListFilters {
  status?: string;
  type?: string;
  page: number;
  pageSize: number;
}
