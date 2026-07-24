import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty({ description: "Cart subtotal (ex. VAT) to validate the coupon against" })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}
