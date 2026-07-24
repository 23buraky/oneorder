import type { PricedLine } from "../../pricing/types/priced-line.type";

export interface CartItemView extends PricedLine {
  cartItemId: string;
  note: string | null;
}

export interface CartView {
  id: string;
  items: CartItemView[];
  itemCount: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface CartIdentity {
  userId?: string;
  guestToken?: string;
}
