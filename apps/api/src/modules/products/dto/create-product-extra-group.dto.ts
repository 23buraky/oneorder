import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsBoolean, IsInt, IsOptional, Min, ValidateNested } from "class-validator";
import { NamedTranslationDto } from "../../../common/dto/named-translation.dto";
import { CreateProductExtraDto } from "./create-product-extra.dto";

export class CreateProductExtraGroupDto {
  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minSelect?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSelect?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [NamedTranslationDto], description: "e.g. \"Sauzen\" / \"Sauces\"" })
  @ValidateNested({ each: true })
  @Type(() => NamedTranslationDto)
  @ArrayMinSize(1)
  translations!: NamedTranslationDto[];

  @ApiProperty({ type: [CreateProductExtraDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateProductExtraDto)
  @ArrayMinSize(1)
  extras!: CreateProductExtraDto[];
}
