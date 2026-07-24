import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Locale } from "@one-order/database";

export class ListProductsQueryDto {
  @ApiPropertyOptional({ enum: Locale, default: Locale.NL })
  @IsOptional()
  @IsEnum(Locale)
  locale: Locale = Locale.NL;

  @ApiPropertyOptional({ description: "Filter by category slug" })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 24, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 24;
}
