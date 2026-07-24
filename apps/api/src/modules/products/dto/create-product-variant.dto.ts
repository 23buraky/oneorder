import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsBoolean, IsInt, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { NamedTranslationDto } from "../../../common/dto/named-translation.dto";

export class CreateProductVariantDto {
  @ApiProperty({ example: 0, description: "Added to the base price when selected" })
  @IsNumber()
  priceModifier!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ type: [NamedTranslationDto] })
  @ValidateNested({ each: true })
  @Type(() => NamedTranslationDto)
  @ArrayMinSize(1)
  translations!: NamedTranslationDto[];
}
