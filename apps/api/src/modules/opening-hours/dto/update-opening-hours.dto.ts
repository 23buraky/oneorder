import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, Matches } from "class-validator";

export class UpdateOpeningHoursDto {
  @ApiPropertyOptional({ example: "11:00" })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "openTime must be in HH:mm format" })
  openTime?: string;

  @ApiPropertyOptional({ example: "22:00" })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "closeTime must be in HH:mm format" })
  closeTime?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isClosed!: boolean;
}
