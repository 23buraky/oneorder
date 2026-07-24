import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateNested,
} from "class-validator";
import { CategoryTranslationDto } from "./category-translation.dto";

export class CreateCategoryDto {
  @ApiProperty({ example: "pizzas" })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase alphanumeric with hyphens only" })
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Parent category id, for subcategories" })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ type: [CategoryTranslationDto] })
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  @ArrayMinSize(1)
  translations!: CategoryTranslationDto[];
}
