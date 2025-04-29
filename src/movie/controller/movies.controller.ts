import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
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
import { MoviesService } from "../service/movies.service";

@ApiTags("Movies")
@ApiExtraModels(WrapperResponse, MovieResponseDto)
@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({
    summary: "List movies with pagination, search & filter",
    description:
      "Returns a paginated list of movies. Supports searching by title and filtering by genre.",
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
              type: "array",
              items: { $ref: getSchemaPath(MovieResponseDto) },
              example: [
                {
                  id: 1,
                  tmdbId: 550,
                  title: "Fight Club",
                  overview:
                    "A depressed man suffering from insomnia meets a strange soap salesman...",
                  posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                  releaseDate: "1999-10-15",
                  avgRating: 8.4,
                  createdAt: "2024-04-29T12:00:00.000Z",
                  updatedAt: "2024-04-29T12:00:00.000Z",
                  genres: [
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
                },
              ],
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
  findAll(@Query() dto: ListMoviesDto): Promise<Movie[]> {
    return this.moviesService.findAll(dto);
  }

  @Get(":id")
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
              example: {
                id: 1,
                tmdbId: 550,
                title: "Fight Club",
                overview:
                  "A depressed man suffering from insomnia meets a strange soap salesman...",
                posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                releaseDate: "1999-10-15",
                avgRating: 8.4,
                createdAt: "2024-04-29T12:00:00.000Z",
                updatedAt: "2024-04-29T12:00:00.000Z",
                genres: [
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
              },
            },
          },
        },
      ],
    },
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
