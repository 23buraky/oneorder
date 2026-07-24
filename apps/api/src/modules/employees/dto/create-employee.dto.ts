import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { EmployeeRole } from "@one-order/database";

export class CreateEmployeeDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({ enum: EmployeeRole })
  @IsEnum(EmployeeRole)
  role!: EmployeeRole;

  @ApiProperty({ example: "4821", description: "4-6 digit PIN for the kitchen-view terminal" })
  @IsString()
  @Matches(/^\d{4,6}$/, { message: "pin must be 4 to 6 digits" })
  pin!: string;
}
