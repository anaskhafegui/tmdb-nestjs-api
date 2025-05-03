import { ApiProperty } from "@nestjs/swagger";
import { Genre } from "../../infrastructure/typeorm/entities/genre.entity";

export class MovieResponseDto {
  @ApiProperty({
    example: 1,
    description: "The unique identifier of the movie",
  })
  id: number;

  @ApiProperty({ example: 550, description: "The TMDB ID of the movie" })
  tmdbId: number;

  @ApiProperty({ example: "Fight Club", description: "The title of the movie" })
  title: string;

  @ApiProperty({
    example:
      "A depressed man suffering from insomnia meets a strange soap salesman...",
    description: "The overview/description of the movie",
  })
  overview: string;

  @ApiProperty({
    example: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    description: "The path to the movie's poster image",
    nullable: true,
  })
  posterPath?: string;

  @ApiProperty({
    example: "1999-10-15",
    description: "The release date of the movie",
    nullable: true,
  })
  releaseDate?: string;

  @ApiProperty({
    example: 8.4,
    description: "The average rating of the movie",
    default: 0,
  })
  avgRating: number;

  @ApiProperty({
    example: "2024-04-29T12:00:00.000Z",
    description: "The date when the movie was added to the database",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-04-29T12:00:00.000Z",
    description: "The date when the movie was last updated",
  })
  updatedAt: Date;

  @ApiProperty({
    type: [Genre],
    example: [
      {
        id: 1,
        tmdbId: 18,
        name: "Drama",
      },
      {
        id: 2,
        tmdbId: 53,
        name: "Thriller",
      },
    ],
    description: "The genres associated with the movie",
  })
  genres: Genre[];
}
