import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OpeningHoursService } from "./opening-hours.service";
import { UpdateOpeningHoursDto } from "./dto/update-opening-hours.dto";
import { CreateOpeningHoursExceptionDto } from "./dto/create-opening-hours-exception.dto";
import { SetManualOverrideDto } from "./dto/set-manual-override.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("opening-hours")
@Controller({ path: "opening-hours", version: "1" })
export class OpeningHoursController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}

  @Get()
  @ApiOperation({ summary: "Get the weekly opening hours" })
  list() {
    return this.openingHoursService.list();
  }

  @Get("status")
  @ApiOperation({ summary: "Check whether the restaurant is open right now" })
  status() {
    return this.openingHoursService.isOpenNow();
  }

  @Get("exceptions")
  @ApiOperation({ summary: "List opening hours exceptions (holidays, etc.)" })
  listExceptions() {
    return this.openingHoursService.listExceptions();
  }

  @Get("manual-override")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current restaurant status override (admin only)" })
  async getManualOverride() {
    return { override: await this.openingHoursService.getManualOverride() };
  }

  @Put("manual-override")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Force the restaurant open/closed regardless of the weekly schedule (admin only)" })
  setManualOverride(@Body() dto: SetManualOverrideDto) {
    return this.openingHoursService.setManualOverride(dto.override);
  }

  @Put(":dayOfWeek")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Set the opening hours for a day (0=Sunday..6=Saturday, admin only)" })
  updateDay(@Param("dayOfWeek", ParseIntPipe) dayOfWeek: number, @Body() dto: UpdateOpeningHoursDto) {
    return this.openingHoursService.updateDay(dayOfWeek, dto);
  }

  @Post("exceptions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add or replace an opening hours exception for a date (admin only)" })
  createException(@Body() dto: CreateOpeningHoursExceptionDto) {
    return this.openingHoursService.createException(dto);
  }

  @Delete("exceptions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an opening hours exception (admin only)" })
  removeException(@Param("id") id: string) {
    return this.openingHoursService.removeException(id);
  }
}
