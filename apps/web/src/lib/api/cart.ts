import { apiRequest } from "./base";
import { toApiLocale } from "./locale";

export interface CartLineExtra {
  id: string;
  name: string;
  priceModifier: number;
}

export interface CartItemView {
  cartItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  variantId: string | null;
  variantName: string | null;
  variantPriceModifier: number;
  extras: CartLineExtra[];
  vatCategory: string;
  vatRatePercentage: number;
  unitPrice: number;
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
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

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  extraIds?: string[];
  quantity?: number;
  note?: string;
}

// `accessToken` is optional everywhere here: the cart works for guests too
// (identified by the cart_token cookie instead), but when it's present the
// API resolves the *user's* cart rather than treating the request as a guest.
export function getCart(locale: string, accessToken?: string): Promise<CartView> {
  return apiRequest<CartView>(`/cart?locale=${toApiLocale(locale)}`, { accessToken });
}

export function addCartItem(input: AddCartItemInput, locale: string, accessToken?: string): Promise<CartView> {
  return apiRequest<CartView>(`/cart/items?locale=${toApiLocale(locale)}`, {
    method: "POST",
    body: JSON.stringify(input),
    accessToken,
  });
}

export function updateCartItemQuantity(
  itemId: string,
  quantity: number,
  locale: string,
  accessToken?: string,
): Promise<CartView> {
  return apiRequest<CartView>(`/cart/items/${itemId}?locale=${toApiLocale(locale)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
    accessToken,
  });
}

export function removeCartItem(itemId: string, locale: string, accessToken?: string): Promise<CartView> {
  return apiRequest<CartView>(`/cart/items/${itemId}?locale=${toApiLocale(locale)}`, {
    method: "DELETE",
    accessToken,
  });
}

export function clearCart(locale: string, accessToken?: string): Promise<CartView> {
  return apiRequest<CartView>(`/cart?locale=${toApiLocale(locale)}`, { method: "DELETE", accessToken });
}
