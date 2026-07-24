import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, Matches } from "class-validator";
import { EmployeeRole } from "@one-order/database";

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ enum: EmployeeRole })
  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "4821" })
  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: "pin must be 4 to 6 digits" })
  pin?: string;
}
