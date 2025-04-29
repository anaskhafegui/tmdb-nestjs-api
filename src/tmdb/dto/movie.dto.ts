// src/tmdb/dto/movie.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class MovieDto {
  @ApiProperty({ description: "TMDB movie identifier", example: 550 })
  @IsInt()
  id: number;

  @ApiProperty({ example: "Fight Club" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Movie overview", example: "A depressed man..." })
  @IsString()
  overview: string;

  @ApiProperty({
    description: "Relative path to poster image",
    example: "/adw6Lq9FiC9zjYEpOqfq03ituwp.jpg",
    required: false,
  })
  @IsString()
  @IsOptional()
  poster_path?: string;

  @ApiProperty({
    description: "Release date (YYYY-MM-DD)",
    example: "1999-10-15",
    required: false,
  })
  @IsString()
  @IsOptional()
  release_date?: string;

  @ApiProperty({
    type: [Number],
    description: "List of genre IDs",
    example: [18, 35],
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  genre_ids?: number[];
}
