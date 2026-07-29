import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional } from "class-validator";

export enum DashboardPeriod {
  TODAY = "TODAY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  ALL = "ALL",
  CUSTOM = "CUSTOM",
}

export class DashboardStatsQueryDto {
  @ApiPropertyOptional({ enum: DashboardPeriod, default: DashboardPeriod.TODAY })
  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod = DashboardPeriod.TODAY;

  @ApiPropertyOptional({ description: "Required when period=CUSTOM" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: "Required when period=CUSTOM" })
  @IsOptional()
  @IsDateString()
  to?: string;
}
