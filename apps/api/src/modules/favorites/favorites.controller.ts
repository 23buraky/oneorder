import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FavoritesService } from "./favorites.service";
import { LocaleQueryDto } from "../../common/dto/locale-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";

@ApiTags("favorites")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller({ path: "favorites", version: "1" })
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's favorite products" })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: LocaleQueryDto) {
    return this.favoritesService.list(user.id, query.locale);
  }

  @Post(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Add a product to favorites" })
  add(@CurrentUser() user: AuthenticatedUser, @Param("productId") productId: string) {
    return this.favoritesService.add(user.id, productId);
  }

  @Delete(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a product from favorites" })
  remove(@CurrentUser() user: AuthenticatedUser, @Param("productId") productId: string) {
    return this.favoritesService.remove(user.id, productId);
  }
}
