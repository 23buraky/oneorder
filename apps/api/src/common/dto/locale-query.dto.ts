import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { Locale } from "@one-order/database";

export class LocaleQueryDto {
  @ApiPropertyOptional({ enum: Locale, default: Locale.NL })
  @IsOptional()
  @IsEnum(Locale)
  locale: Locale = Locale.NL;
}
