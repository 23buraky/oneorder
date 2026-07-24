import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "sofia@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Sofia" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: "De Vries" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({
    example: "Str0ngP@ssw0rd!",
    description: "Min. 8 characters, at least one letter and one number",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt silently truncates beyond 72 bytes
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: "password must contain at least one letter and one number",
  })
  password!: string;

  @ApiProperty({ example: "+32470123456", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}
