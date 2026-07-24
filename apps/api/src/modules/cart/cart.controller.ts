import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { LocaleQueryDto } from "../../common/dto/locale-query.dto";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import type { CartIdentity } from "./types/cart-view.type";
import { CART_COOKIE_NAME, CART_TTL_DAYS } from "./constants/cart.constants";
import type { ResolvedCart } from "./cart.service";

@ApiTags("cart")
@UseGuards(OptionalJwtAuthGuard)
@Controller({ path: "cart", version: "1" })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current cart (guest or logged-in)" })
  async getCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: LocaleQueryDto,
  ) {
    const { view, resolved } = await this.cartService.getCart(this.buildIdentity(user, req), query.locale);
    this.applyGuestCookie(res, resolved);
    return view;
  }

  @Post("items")
  @ApiOperation({ summary: "Add an item to the cart" })
  async addItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
    @Query() query: LocaleQueryDto,
  ) {
    const { view, resolved } = await this.cartService.addItem(this.buildIdentity(user, req), dto, query.locale);
    this.applyGuestCookie(res, resolved);
    return view;
  }

  @Patch("items/:itemId")
  @ApiOperation({ summary: "Update a cart item's quantity" })
  async updateItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Query() query: LocaleQueryDto,
  ) {
    const { view, resolved } = await this.cartService.updateItemQuantity(
      this.buildIdentity(user, req),
      itemId,
      dto.quantity,
      query.locale,
    );
    this.applyGuestCookie(res, resolved);
    return view;
  }

  @Delete("items/:itemId")
  @ApiOperation({ summary: "Remove an item from the cart" })
  async removeItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param("itemId") itemId: string,
    @Query() query: LocaleQueryDto,
  ) {
    const { view, resolved } = await this.cartService.removeItem(this.buildIdentity(user, req), itemId, query.locale);
    this.applyGuestCookie(res, resolved);
    return view;
  }

  @Delete()
  @ApiOperation({ summary: "Empty the cart" })
  async clearCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: LocaleQueryDto,
  ) {
    const { view, resolved } = await this.cartService.clearCart(this.buildIdentity(user, req), query.locale);
    this.applyGuestCookie(res, resolved);
    return view;
  }

  private buildIdentity(user: AuthenticatedUser | undefined, req: Request): CartIdentity {
    return {
      userId: user?.id,
      guestToken: (req.cookies as Record<string, string> | undefined)?.[CART_COOKIE_NAME],
    };
  }

  private applyGuestCookie(res: Response, resolved: ResolvedCart): void {
    if (!resolved.newGuestToken) return;

    res.cookie(CART_COOKIE_NAME, resolved.newGuestToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_TTL_DAYS * 24 * 60 * 60 * 1000,
    });
  }
}
