// src/tmdb/tmdb.controller.ts
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { GenreDto } from "./dto/genre.dto";
import { GetPopularDto } from "./dto/get-popular.dto";
import { MovieDto } from "./dto/movie.dto";
import { TmdbService } from "./tmdb.service";
@ApiTags("TMDB")
@Controller("tmdb")
export class TmdbController {
  constructor(private readonly tmdb: TmdbService) {}

  @Get("popular")
  @ApiOperation({ summary: "Fetch popular movies from TMDB" })
  @ApiOkResponse({
    description: "List of popular movies",
    type: MovieDto,
    isArray: true,
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPopular(@Query() dto: GetPopularDto): Promise<MovieDto[]> {
    return this.tmdb.fetchPopular(dto.page);
  }

  @Get("genres")
  @ApiOperation({ summary: "Fetch movie genres from TMDB" })
  @ApiOkResponse({
    description: "List of movie genres",
    type: GenreDto,
    isArray: true,
  })
  async getGenres(): Promise<GenreDto[]> {
    return this.tmdb.fetchGenres();
  }
}
