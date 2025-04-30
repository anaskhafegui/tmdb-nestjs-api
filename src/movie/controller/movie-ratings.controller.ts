import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { GetUser } from "../../auth/decorators/get-user.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { MovieRating } from "../../infrastructure/typeorm/entities/movie-rating.entity";
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { RateMovieDto } from "../dto/rate-movie.dto";
import { MovieRatingsService } from "../service/movie-ratings.service";

@ApiTags("Movie Ratings")
@Controller("movies")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Post(":id/rate")
  @ApiOperation({ summary: "Rate a movie" })
  @ApiResponse({
    status: 201,
    description: "The rating has been successfully created/updated.",
    type: MovieRating,
  })
  async rateMovie(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User,
    @Body() rateMovieDto: RateMovieDto
  ): Promise<MovieRating> {
    return this.movieRatingsService.rateMovie(movieId, user.id, rateMovieDto);
  }

  @Get(":id/rating")
  @ApiOperation({ summary: "Get user's rating for a movie" })
  @ApiResponse({
    status: 200,
    description: "Returns the user's rating for the movie.",
    type: MovieRating,
  })
  async getUserRating(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<MovieRating> {
    return this.movieRatingsService.getUserRating(movieId, user.id);
  }

  @Delete(":id/rating")
  @ApiOperation({ summary: "Delete user's rating for a movie" })
  @ApiResponse({
    status: 200,
    description: "The rating has been successfully deleted.",
  })
  async deleteRating(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<void> {
    return this.movieRatingsService.deleteRating(movieId, user.id);
  }
}
