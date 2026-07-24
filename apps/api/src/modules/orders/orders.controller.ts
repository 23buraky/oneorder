import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { OrdersService } from "./orders.service";
import { CheckoutDto } from "./dto/checkout.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { LocaleQueryDto } from "../../common/dto/locale-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import type { CartIdentity } from "../cart/types/cart-view.type";
import { CART_COOKIE_NAME, CART_TTL_DAYS } from "../cart/constants/cart.constants";

@ApiTags("orders")
@Controller({ path: "orders", version: "1" })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Check out the current cart into a new order (guest or logged-in)" })
  async checkout(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CheckoutDto,
    @Query() query: LocaleQueryDto,
  ) {
    const identity = this.buildIdentity(user, req);
    const { order, newGuestToken } = await this.ordersService.checkout(identity, dto, query.locale);

    if (newGuestToken) {
      res.cookie(CART_COOKIE_NAME, newGuestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: CART_TTL_DAYS * 24 * 60 * 60 * 1000,
      });
    }

    return order;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the current user's orders" })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.listForUser(user.id);
  }

  @Get(":orderNumber")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get order detail (owner, or guest with matching email)" })
  getByOrderNumber(
    @Param("orderNumber") orderNumber: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
    @Query("guestEmail") guestEmail?: string,
  ) {
    return this.ordersService.findByOrderNumber(orderNumber, this.buildIdentity(user, req), guestEmail);
  }

  @Patch(":orderNumber/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "EMPLOYEE")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an order's status (kitchen/staff/admin only)" })
  updateStatus(
    @Param("orderNumber") orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.updateStatus(orderNumber, dto, user.id);
  }

  private buildIdentity(user: AuthenticatedUser | undefined, req: Request): CartIdentity {
    return {
      userId: user?.id,
      guestToken: (req.cookies as Record<string, string> | undefined)?.[CART_COOKIE_NAME],
    };
  }
}
