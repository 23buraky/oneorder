import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsBoolean, IsInt, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { NamedTranslationDto } from "../../../common/dto/named-translation.dto";

export class CreateProductExtraDto {
  @ApiProperty({ example: 1.5, description: "Added to the item price when selected" })
  @IsNumber()
  priceModifier!: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [NamedTranslationDto] })
  @ValidateNested({ each: true })
  @Type(() => NamedTranslationDto)
  @ArrayMinSize(1)
  translations!: NamedTranslationDto[];
}
