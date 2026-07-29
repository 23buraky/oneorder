import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class SetManualOverrideDto {
  @ApiProperty({ description: "true = force the restaurant closed regardless of schedule" })
  @IsBoolean()
  forceClosed!: boolean;
}
