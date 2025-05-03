// src/tmdb/dto/genre.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class GenreDto {
  @ApiProperty({ description: "TMDB genre identifier", example: 18 })
  @IsInt()
  id: number;

  @ApiProperty({ example: "Drama" })
  @IsString()
  name: string;
}
