import { ApiProperty } from "@nestjs/swagger";
import { MovieRating } from "../../infrastructure/typeorm/entities/movie-rating.entity";

export class RatingResponseDto {
  @ApiProperty({
    description: "Status code of the response",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Message describing the response",
    example: "Rating retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "The rating data",
    type: MovieRating,
  })
  data: MovieRating;
}
