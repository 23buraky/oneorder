import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoyaltyService } from "./loyalty.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";

@ApiTags("loyalty")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller({ path: "loyalty", version: "1" })
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get("me")
  @ApiOperation({ summary: "Get the current user's loyalty points, level and progress" })
  getMyLoyalty(@CurrentUser() user: AuthenticatedUser) {
    return this.loyaltyService.getMyLoyalty(user.id);
  }

  @Get("transactions")
  @ApiOperation({ summary: "List the current user's loyalty point history" })
  getTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.loyaltyService.getTransactions(user.id);
  }
}
