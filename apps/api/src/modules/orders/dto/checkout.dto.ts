import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { OrderType } from "@one-order/database";

export class CheckoutDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type!: OrderType;

  @ApiPropertyOptional({ description: "Required for guest checkout" })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional({ description: "Required for guest checkout" })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiPropertyOptional({ description: "An existing saved address id (logged-in users)" })
  @IsOptional()
  @IsString()
  deliveryAddressId?: string;

  @ApiPropertyOptional({ description: "Inline address, used when not selecting a saved address" })
  @IsOptional()
  @IsString()
  deliveryStreet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryHouseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryBox?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryPostalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip?: number;
}
