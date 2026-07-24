import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAddressDto {
  @ApiProperty({ example: "Thuis" })
  @IsString()
  @MaxLength(50)
  label!: string;

  @ApiProperty()
  @IsString()
  street!: string;

  @ApiProperty()
  @IsString()
  houseNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  box?: string;

  @ApiProperty()
  @IsString()
  postalCode!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiPropertyOptional({ default: "BE" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
