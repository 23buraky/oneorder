import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class SetManualOverrideDto {
  @ApiProperty({
    enum: ["AUTO", "OPEN", "CLOSED"],
    description: "AUTO follows the weekly schedule, OPEN/CLOSED force it regardless of schedule",
  })
  @IsIn(["AUTO", "OPEN", "CLOSED"])
  override!: "AUTO" | "OPEN" | "CLOSED";
}
