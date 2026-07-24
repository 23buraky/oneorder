import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";

@ApiTags("addresses")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller({ path: "addresses", version: "1" })
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's saved addresses" })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.addressesService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: "Add a new saved address" })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a saved address" })
  update(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a saved address" })
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.addressesService.remove(user.id, id);
  }
}
