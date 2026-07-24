import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Cart, CartItem, CartItemExtra, Locale } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { PricingService } from "../pricing/pricing.service";
import { generateOpaqueToken } from "../auth/utils/token.util";
import { CART_TOKEN_BYTES, CART_TTL_DAYS } from "./constants/cart.constants";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import type { CartIdentity, CartItemView, CartView } from "./types/cart-view.type";

export type CartWithItems = Cart & { items: (CartItem & { extras: CartItemExtra[] })[] };

export interface ResolvedCart {
  cart: CartWithItems;
  newGuestToken: string | null;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async getCart(identity: CartIdentity, locale: Locale): Promise<{ view: CartView; resolved: ResolvedCart }> {
    const resolved = await this.resolveCart(identity);
    const view = await this.buildView(resolved.cart, locale);
    return { view, resolved };
  }

  async addItem(
    identity: CartIdentity,
    dto: AddCartItemDto,
    locale: Locale,
  ): Promise<{ view: CartView; resolved: ResolvedCart }> {
    const resolved = await this.resolveCart(identity);
    const extraIds = [...new Set(dto.extraIds ?? [])].sort();

    // Priced purely for validation here — the write itself stores the raw
    // selection, never a cached price, so the cart always reflects live pricing.
    await this.pricingService.priceLine({
      productId: dto.productId,
      variantId: dto.variantId,
      extraIds,
      quantity: dto.quantity ?? 1,
      locale,
    });

    const existingItem = resolved.cart.items.find(
      (item) =>
        item.productId === dto.productId &&
        (item.selectedVariantId ?? null) === (dto.variantId ?? null) &&
        this.sameExtraIds(item.extras.map((e) => e.extraId), extraIds),
    );

    if (existingItem) {
      await this.prisma.client.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (dto.quantity ?? 1) },
      });
    } else {
      await this.prisma.client.cartItem.create({
        data: {
          cartId: resolved.cart.id,
          productId: dto.productId,
          selectedVariantId: dto.variantId,
          quantity: dto.quantity ?? 1,
          note: dto.note,
          extras: { create: extraIds.map((extraId) => ({ extraId })) },
        },
      });
    }

    await this.touchCart(resolved.cart.id);
    const cart = await this.getCartOrThrow(resolved.cart.id);
    return { view: await this.buildView(cart, locale), resolved: { ...resolved, cart } };
  }

  async updateItemQuantity(
    identity: CartIdentity,
    itemId: string,
    quantity: number,
    locale: Locale,
  ): Promise<{ view: CartView; resolved: ResolvedCart }> {
    const resolved = await this.resolveCart(identity);
    this.assertItemBelongsToCart(resolved.cart, itemId);

    await this.prisma.client.cartItem.update({ where: { id: itemId }, data: { quantity } });
    await this.touchCart(resolved.cart.id);

    const cart = await this.getCartOrThrow(resolved.cart.id);
    return { view: await this.buildView(cart, locale), resolved: { ...resolved, cart } };
  }

  async removeItem(
    identity: CartIdentity,
    itemId: string,
    locale: Locale,
  ): Promise<{ view: CartView; resolved: ResolvedCart }> {
    const resolved = await this.resolveCart(identity);
    this.assertItemBelongsToCart(resolved.cart, itemId);

    await this.prisma.client.cartItem.delete({ where: { id: itemId } });

    const cart = await this.getCartOrThrow(resolved.cart.id);
    return { view: await this.buildView(cart, locale), resolved: { ...resolved, cart } };
  }

  async clearCart(identity: CartIdentity, locale: Locale): Promise<{ view: CartView; resolved: ResolvedCart }> {
    const resolved = await this.resolveCart(identity);
    await this.emptyCart(resolved.cart.id);

    const cart = await this.getCartOrThrow(resolved.cart.id);
    return { view: await this.buildView(cart, locale), resolved: { ...resolved, cart } };
  }

  // Used by OrdersService right after a successful checkout — no re-pricing
  // needed since nothing calls back into the (now empty) cart afterwards.
  async emptyCart(cartId: string): Promise<void> {
    await this.prisma.client.cartItem.deleteMany({ where: { cartId } });
  }

  // Finds (or creates) the right cart for this request, claiming/merging a
  // guest cart into a user's cart the moment a guest token shows up
  // alongside a logged-in request (i.e. right after login).
  // Public because OrdersService needs the raw cart (with items+extras) to
  // build order line snapshots — CartView's PricedLine has no cartItemId/note.
  async resolveCart(identity: CartIdentity): Promise<ResolvedCart> {
    if (identity.userId) {
      let userCart = await this.prisma.client.cart.findUnique({
        where: { userId: identity.userId },
        include: { items: { include: { extras: true } } },
      });

      if (identity.guestToken) {
        const guestCart = await this.prisma.client.cart.findUnique({
          where: { guestToken: identity.guestToken },
          include: { items: { include: { extras: true } } },
        });

        if (guestCart && guestCart.userId !== identity.userId) {
          if (!userCart) {
            userCart = await this.prisma.client.cart.update({
              where: { id: guestCart.id },
              data: { userId: identity.userId, guestToken: null, expiresAt: this.newExpiry() },
              include: { items: { include: { extras: true } } },
            });
          } else {
            await this.mergeCarts(guestCart.id, userCart.id);
            userCart = await this.getCartOrThrow(userCart.id);
          }
        }
      }

      if (!userCart) {
        userCart = await this.prisma.client.cart.create({
          data: { userId: identity.userId, expiresAt: this.newExpiry() },
          include: { items: { include: { extras: true } } },
        });
      }

      return { cart: userCart, newGuestToken: null };
    }

    if (identity.guestToken) {
      const guestCart = await this.prisma.client.cart.findUnique({
        where: { guestToken: identity.guestToken },
        include: { items: { include: { extras: true } } },
      });
      if (guestCart) {
        return { cart: guestCart, newGuestToken: null };
      }
    }

    const newGuestToken = generateOpaqueToken(CART_TOKEN_BYTES);
    const cart = await this.prisma.client.cart.create({
      data: { guestToken: newGuestToken, expiresAt: this.newExpiry() },
      include: { items: { include: { extras: true } } },
    });

    return { cart, newGuestToken };
  }

  private async mergeCarts(guestCartId: string, userCartId: string): Promise<void> {
    // Simple move-over merge: guest items become user items as-is, even if
    // an equivalent line already exists in the user's cart. Good enough for
    // the rare case of a guest cart existing at login time.
    await this.prisma.client.cartItem.updateMany({
      where: { cartId: guestCartId },
      data: { cartId: userCartId },
    });
    await this.prisma.client.cart.delete({ where: { id: guestCartId } });
    await this.touchCart(userCartId);
  }

  private async touchCart(cartId: string): Promise<void> {
    await this.prisma.client.cart.update({ where: { id: cartId }, data: { expiresAt: this.newExpiry() } });
  }

  private newExpiry(): Date {
    return new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000);
  }

  private async getCartOrThrow(cartId: string): Promise<CartWithItems> {
    const cart = await this.prisma.client.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { extras: true } } },
    });
    if (!cart) {
      throw new NotFoundException("Cart not found");
    }
    return cart;
  }

  private assertItemBelongsToCart(cart: CartWithItems, itemId: string): void {
    if (!cart.items.some((item) => item.id === itemId)) {
      throw new BadRequestException(`Cart item "${itemId}" not found in this cart`);
    }
  }

  private sameExtraIds(a: string[], b: string[]): boolean {
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.length === sortedB.length && sortedA.every((id, index) => id === sortedB[index]);
  }

  private async buildView(cart: CartWithItems, locale: Locale): Promise<CartView> {
    const items: CartItemView[] = [];

    for (const item of cart.items) {
      const priced = await this.pricingService.priceLine({
        productId: item.productId,
        variantId: item.selectedVariantId ?? undefined,
        extraIds: item.extras.map((extra) => extra.extraId),
        quantity: item.quantity,
        locale,
      });
      items.push({ ...priced, cartItemId: item.id, note: item.note });
    }

    const subtotal = this.sumRounded(items.map((item) => item.lineSubtotal));
    const vatAmount = this.sumRounded(items.map((item) => item.lineVatAmount));
    const total = this.sumRounded(items.map((item) => item.lineTotal));

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      vatAmount,
      total,
    };
  }

  private sumRounded(values: number[]): number {
    return Math.round(values.reduce((sum, value) => sum + value, 0) * 100) / 100;
  }
}
