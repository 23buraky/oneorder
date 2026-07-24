import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional, IsString, Matches } from "class-validator";

export class CreateOpeningHoursExceptionDto {
  @ApiProperty({ example: "2026-12-25" })
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @ApiProperty({ default: true })
  @IsBoolean()
  isClosed!: boolean;

  @ApiPropertyOptional({ example: "11:00" })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "openTime must be in HH:mm format" })
  openTime?: string;

  @ApiPropertyOptional({ example: "22:00" })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "closeTime must be in HH:mm format" })
  closeTime?: string;

  @ApiPropertyOptional({ example: "Kerstmis" })
  @IsOptional()
  @IsString()
  reason?: string;
}
