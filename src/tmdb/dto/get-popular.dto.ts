// src/tmdb/dto/get-popular.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class GetPopularDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
}
