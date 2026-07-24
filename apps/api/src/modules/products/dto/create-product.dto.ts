import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { VatCategory } from "@one-order/database";
import { ProductTranslationDto } from "./product-translation.dto";
import { ProductImageDto } from "./product-image.dto";
import { CreateProductVariantGroupDto } from "./create-product-variant-group.dto";
import { CreateProductExtraGroupDto } from "./create-product-extra-group.dto";
import { CreateProductAvailabilityDto } from "./create-product-availability.dto";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: "PIZ-MARG-001" })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ enum: VatCategory, default: VatCategory.FOOD_TAKEAWAY })
  @IsOptional()
  @IsEnum(VatCategory)
  vatCategory?: VatCategory;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "null = unlimited stock" })
  @IsOptional()
  @IsInt()
  stock?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [ProductTranslationDto] })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  @ArrayMinSize(1)
  translations!: ProductTranslationDto[];

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [CreateProductVariantGroupDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantGroupDto)
  variantGroups?: CreateProductVariantGroupDto[];

  @ApiPropertyOptional({ type: [CreateProductExtraGroupDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductExtraGroupDto)
  extraGroups?: CreateProductExtraGroupDto[];

  @ApiPropertyOptional({ type: [String], description: "Existing Ingredient ids to link" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientIds?: string[];

  @ApiPropertyOptional({ type: [String], description: "Existing Allergen ids to link" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergenIds?: string[];

  @ApiPropertyOptional({ type: [CreateProductAvailabilityDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductAvailabilityDto)
  availability?: CreateProductAvailabilityDto[];
}
