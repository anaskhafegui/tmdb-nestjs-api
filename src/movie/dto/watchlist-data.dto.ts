import { ApiProperty } from "@nestjs/swagger";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";

export class WatchlistDataDto {
  @ApiProperty({
    description: "Watchlist entry ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Date when the movie was added to watchlist",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Date when the watchlist entry was last updated",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "The movie details",
    type: Movie,
  })
  movie: Movie;
}
