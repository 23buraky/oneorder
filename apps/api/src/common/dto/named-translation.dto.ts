import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { Locale } from "@one-order/database";

// Shared shape for translations that only carry a single "name" field —
// variant groups, variants, extra groups, extras, ingredients, allergens.
export class NamedTranslationDto {
  @ApiProperty({ enum: Locale })
  @IsEnum(Locale)
  locale!: Locale;

  @ApiProperty({ example: "Groot" })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}
