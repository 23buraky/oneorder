import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Matches, Max, Min } from "class-validator";

export class CreateProductAvailabilityDto {
  @ApiProperty({ minimum: 0, maximum: 6, description: "0 = Sunday ... 6 = Saturday" })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: "11:00" })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "startTime must be in HH:mm format" })
  startTime!: string;

  @ApiProperty({ example: "15:00" })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "endTime must be in HH:mm format" })
  endTime!: string;
}
