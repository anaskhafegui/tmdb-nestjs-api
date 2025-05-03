import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListMoviesDto {
  @ApiPropertyOptional({ example: 1, description: "Page number", default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: "Items per page",
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    example: "Action",
    description: "Filter by genre name",
  })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ example: "Matrix", description: "Search by title" })
  @IsString()
  @IsOptional()
  search?: string;
}
