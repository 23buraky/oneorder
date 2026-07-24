import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsInt, IsOptional, ValidateNested } from "class-validator";
import { NamedTranslationDto } from "../../../common/dto/named-translation.dto";
import { CreateProductVariantDto } from "./create-product-variant.dto";

export class CreateProductVariantGroupDto {
  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [NamedTranslationDto], description: "e.g. \"Grootte\" / \"Size\"" })
  @ValidateNested({ each: true })
  @Type(() => NamedTranslationDto)
  @ArrayMinSize(1)
  translations!: NamedTranslationDto[];

  @ApiProperty({ type: [CreateProductVariantDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @ArrayMinSize(1)
  variants!: CreateProductVariantDto[];
}
