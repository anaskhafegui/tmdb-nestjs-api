import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { WrapperResponse } from "../../common/dtos/wrapper-response.dto";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";
import { MovieResponseDto } from "../dto/movie-response.dto";
import { PaginationResponse } from "../interfaces/pagination.interface";
import { MoviesService } from "../service/movies.service";

@ApiTags("Movies")
@ApiExtraModels(WrapperResponse, MovieResponseDto)
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("movies")
@UseInterceptors(CacheInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @CacheKey("movies-list")
  @CacheTTL(3600) // 1 hour cache
  @ApiOperation({
    summary: "List movies with pagination, search & filter",
    description:
      "Returns a paginated list of movies with metadata. Supports searching by title and filtering by genre.",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved list of movies",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: { $ref: getSchemaPath(MovieResponseDto) },
                },
                meta: {
                  type: "object",
                  properties: {
                    total: { type: "number", example: 100 },
                    page: { type: "number", example: 1 },
                    limit: { type: "number", example: 20 },
                    totalPages: { type: "number", example: 5 },
                    hasNextPage: { type: "boolean", example: true },
                    hasPreviousPage: { type: "boolean", example: false },
                    nextPage: { type: "number", nullable: true, example: 2 },
                    previousPage: {
                      type: "number",
                      nullable: true,
                      example: null,
                    },
                  },
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 20)",
    example: 20,
  })
  @ApiQuery({
    name: "genre",
    required: false,
    type: String,
    description: "Filter by genre name",
    example: "Action",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by movie title",
    example: "Matrix",
  })
  findAll(@Query() dto: ListMoviesDto): Promise<PaginationResponse<Movie>> {
    return this.moviesService.findAll(dto);
  }

  @Get(":id")
  @CacheKey("movie-detail")
  @CacheTTL(3600) // 1 hour cache
  @ApiOperation({
    summary: "Get a single movie by id",
    description: "Returns detailed information about a specific movie",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved movie details",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              $ref: getSchemaPath(MovieResponseDto),
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
    status: 404,
    description: "Movie not found",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    example: 1,
    type: Number,
  })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Movie> {
    return this.moviesService.findOne(id);
  }
}
