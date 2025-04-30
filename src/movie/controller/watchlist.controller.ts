import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { WatchlistResponseDto } from "../dto/watchlist-response.dto";
import { WatchlistService } from "../service/watchlist.service";

@ApiTags("Watchlist")
@Controller("movies")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post(":id/watchlist")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Add movie to watchlist",
    description: "Add a movie to the user's watchlist.",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    type: "integer",
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The movie has been successfully added to the watchlist.",
    type: WatchlistResponseDto,
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
  async addToWatchlist(
    @Param("id") movieId: string,
    @GetUser() user: User
  ): Promise<WatchlistResponseDto> {
    const watchlist = await this.watchlistService.addToWatchlist(
      parseInt(movieId, 10),
      user.id
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: "Movie added to watchlist successfully",
      data: [watchlist],
    };
  }

  @Delete(":id/watchlist")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove movie from watchlist",
    description: "Remove a movie from the user's watchlist.",
  })
  @ApiParam({
    name: "id",
    description: "Movie ID",
    type: "integer",
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "The movie has been successfully removed from the watchlist.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Watchlist entry not found",
    schema: {
      example: {
        statusCode: 404,
        message: "Watchlist entry not found for movie 1 and user 1",
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
  async removeFromWatchlist(
    @Param("id") movieId: string,
    @GetUser() user: User
  ): Promise<void> {
    await this.watchlistService.removeFromWatchlist(
      parseInt(movieId, 10),
      user.id
    );
  }

  @Get("watchlist")
  @ApiOperation({
    summary: "Get user's watchlist",
    description: "Retrieve all movies in the user's watchlist.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the user's watchlist.",
    type: WatchlistResponseDto,
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
  async getWatchlist(@GetUser() user: User): Promise<WatchlistResponseDto> {
    console.log('Fetching watchlist for user ID:', user.id);
    const watchlist = await this.watchlistService.getWatchlist(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: "Watchlist retrieved successfully",
      data: watchlist,
    };
  }
}
