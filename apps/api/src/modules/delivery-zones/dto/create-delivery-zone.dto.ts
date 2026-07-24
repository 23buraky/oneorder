import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: "Antwerpen Centrum" })
  @IsString()
  name!: string;

  @ApiProperty({ type: [String], example: ["2000", "2018", "2020"] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  postalCodes!: string[];

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  deliveryFee!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  minOrderAmount!: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  estimatedDeliveryMinutes!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
