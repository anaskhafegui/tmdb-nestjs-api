import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { GetUser } from "../../auth/decorators/get-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { RateMovieDto } from "../dto/rate-movie.dto";
import { RatingResponseDto } from "../dto/rating-response.dto";
import { MovieRatingsService } from "../service/movie-ratings.service";

@ApiTags("Movie Ratings")
@Controller("movies")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Post(":id/rate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Rate a movie",
    description:
      "Rate a movie with a value between 1 and 5 stars. Optionally add a comment.",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    type: "integer",
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The rating has been successfully created/updated.",
    type: RatingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Movie not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Movie with ID 1 not found",
        error: "Not Found",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Invalid or missing JWT token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  async rateMovie(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User,
    @Body() rateMovieDto: RateMovieDto
  ): Promise<RatingResponseDto> {
    const rating = await this.movieRatingsService.rateMovie(
      movieId,
      user.id,
      rateMovieDto
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: "Rating created successfully",
      data: rating,
    };
  }

  @Get(":id/rating")
  @ApiOperation({
    summary: "Get user's rating for a movie",
    description: "Retrieve the current user's rating for a specific movie.",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    type: "integer",
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the user's rating for the movie.",
    type: RatingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Rating not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Rating not found for movie 1 and user 1",
        error: "Not Found",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Invalid or missing JWT token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  async getUserRating(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<RatingResponseDto> {
    const rating = await this.movieRatingsService.getUserRating(
      movieId,
      user.id
    );
    return {
      statusCode: HttpStatus.OK,
      message: "Rating retrieved successfully",
      data: rating,
    };
  }

  @Delete(":id/rating")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete user's rating for a movie",
    description: "Remove the current user's rating for a specific movie.",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    type: "integer",
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "The rating has been successfully deleted.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Rating not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Rating not found for movie 1 and user 1",
        error: "Not Found",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Invalid or missing JWT token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  async deleteRating(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<void> {
    await this.movieRatingsService.deleteRating(movieId, user.id);
  }
}
