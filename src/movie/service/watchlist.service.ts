import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { Watchlist } from "../../infrastructure/typeorm/entities/watchlist.entity";
import { WatchlistDto } from "../dto/watchlist.dto";

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepo: Repository<Watchlist>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>
  ) {}

  async addToWatchlist(
    movieId: number,
    userId: number,
    watchlistDto: WatchlistDto
  ): Promise<Watchlist> {
    const movie = await this.movieRepo.findOne({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    let watchlistEntry = await this.watchlistRepo.findOne({
      where: { movieId, userId },
    });

    if (watchlistEntry) {
      // Update existing entry
      watchlistEntry.isFavorite =
        watchlistDto.isFavorite ?? watchlistEntry.isFavorite;
    } else {
      // Create new entry
      watchlistEntry = this.watchlistRepo.create({
        movieId,
        userId,
        isFavorite: watchlistDto.isFavorite ?? false,
      });
    }

    return this.watchlistRepo.save(watchlistEntry);
  }

  async removeFromWatchlist(movieId: number, userId: number): Promise<void> {
    const result = await this.watchlistRepo.delete({ movieId, userId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Movie ${movieId} not found in user ${userId}'s watchlist`
      );
    }
  }

  async getUserWatchlist(userId: number): Promise<Watchlist[]> {
    return this.watchlistRepo.find({
      where: { userId },
      relations: ["movie"],
      order: { createdAt: "DESC" },
    });
  }

  async getUserFavorites(userId: number): Promise<Watchlist[]> {
    return this.watchlistRepo.find({
      where: { userId, isFavorite: true },
      relations: ["movie"],
      order: { createdAt: "DESC" },
    });
  }

  async toggleFavorite(movieId: number, userId: number): Promise<Watchlist> {
    const watchlistEntry = await this.watchlistRepo.findOne({
      where: { movieId, userId },
    });

    if (!watchlistEntry) {
      throw new NotFoundException(
        `Movie ${movieId} not found in user ${userId}'s watchlist`
      );
    }

    watchlistEntry.isFavorite = !watchlistEntry.isFavorite;
    return this.watchlistRepo.save(watchlistEntry);
  }
}
