// src/tmdb/tmdb.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { WrapperResponse } from "../common/dtos/wrapper-response.dto";
import { GetPopularDto } from "./dto/get-popular.dto";
import { TmdbService } from "./tmdb.service";

@ApiTags("TMDB")
@ApiExtraModels(WrapperResponse)
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("tmdb")
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get("popular")
  @ApiOperation({
    summary: "Get popular movies from TMDB",
    description: "Returns a list of popular movies from The Movie Database API",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved popular movies",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number", example: 550 },
                  title: { type: "string", example: "Fight Club" },
                  overview: { type: "string" },
                  poster_path: {
                    type: "string",
                    example: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                  },
                  release_date: { type: "string", example: "1999-10-15" },
                  vote_average: { type: "number", example: 8.4 },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid query parameters",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  @ApiResponse({
    status: 429,
    description: "Too Many Requests - Rate limit exceeded",
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
    example: 1,
  })
  getPopularMovies(@Query() dto: GetPopularDto) {
    return this.tmdbService.fetchPopular(dto.page);
  }

  @Get("genres")
  @ApiOperation({
    summary: "Get movie genres from TMDB",
    description: "Returns a list of movie genres from The Movie Database API",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved movie genres",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number", example: 28 },
                  name: { type: "string", example: "Action" },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  @ApiResponse({
    status: 429,
    description: "Too Many Requests - Rate limit exceeded",
  })
  getGenres() {
    return this.tmdbService.fetchGenres();
  }
}
