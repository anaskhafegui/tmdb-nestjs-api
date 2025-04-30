import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { Watchlist } from "../../infrastructure/typeorm/entities/watchlist.entity";
import { WatchlistDto } from "../dto/watchlist.dto";
import { WatchlistService } from "../service/watchlist.service";

@ApiTags("Watchlist")
@Controller("watchlist")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post("movies/:id")
  @ApiOperation({ summary: "Add movie to watchlist" })
  @ApiResponse({
    status: 201,
    description: "The movie has been added to the watchlist.",
    type: Watchlist,
  })
  async addToWatchlist(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User,
    @Body() watchlistDto: WatchlistDto
  ): Promise<Watchlist> {
    return this.watchlistService.addToWatchlist(movieId, user.id, watchlistDto);
  }

  @Delete("movies/:id")
  @ApiOperation({ summary: "Remove movie from watchlist" })
  @ApiResponse({
    status: 200,
    description: "The movie has been removed from the watchlist.",
  })
  async removeFromWatchlist(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<void> {
    return this.watchlistService.removeFromWatchlist(movieId, user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get user's watchlist" })
  @ApiResponse({
    status: 200,
    description: "Returns the user's watchlist.",
    type: [Watchlist],
  })
  async getUserWatchlist(@GetUser() user: User): Promise<Watchlist[]> {
    return this.watchlistService.getUserWatchlist(user.id);
  }

  @Get("favorites")
  @ApiOperation({ summary: "Get user's favorite movies" })
  @ApiResponse({
    status: 200,
    description: "Returns the user's favorite movies.",
    type: [Watchlist],
  })
  async getUserFavorites(@GetUser() user: User): Promise<Watchlist[]> {
    return this.watchlistService.getUserFavorites(user.id);
  }

  @Put("movies/:id/favorite")
  @ApiOperation({ summary: "Toggle favorite status of a movie" })
  @ApiResponse({
    status: 200,
    description: "The favorite status has been toggled.",
    type: Watchlist,
  })
  async toggleFavorite(
    @Param("id", ParseIntPipe) movieId: number,
    @GetUser() user: User
  ): Promise<Watchlist> {
    return this.watchlistService.toggleFavorite(movieId, user.id);
  }
}
