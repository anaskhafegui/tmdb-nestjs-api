import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class RateMovieDto {
  @ApiProperty({
    description: "Rating value between 1 and 5",
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: "Optional comment for the rating",
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
