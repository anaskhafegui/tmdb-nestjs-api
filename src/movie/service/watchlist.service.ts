import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Watchlist } from "../../infrastructure/typeorm/entities/watchlist.entity";
import { WatchlistDataDto } from "../dto/watchlist-data.dto";

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>
  ) {}

  private toDto(watchlist: Watchlist): WatchlistDataDto {
    const dto = new WatchlistDataDto();
    dto.id = watchlist.id;
    dto.createdAt = watchlist.createdAt;
    dto.updatedAt = watchlist.updatedAt;
    dto.movie = watchlist.movie;
    return dto;
  }

  async addToWatchlist(
    movieId: number,
    userId: number
  ): Promise<WatchlistDataDto> {
    const existingWatchlist = await this.watchlistRepository.findOne({
      where: { movieId, userId },
    });

    if (existingWatchlist) {
      throw new ConflictException(
        `Movie ${movieId} is already in watchlist for user ${userId}`
      );
    }

    const watchlist = this.watchlistRepository.create({
      movieId,
      userId,
    });
    const savedWatchlist = await this.watchlistRepository.save(watchlist);
    const watchlistWithMovie = await this.watchlistRepository.findOne({
      where: { id: savedWatchlist.id },
      relations: ["movie"],
    });
    return this.toDto(watchlistWithMovie);
  }

  async removeFromWatchlist(movieId: number, userId: number): Promise<void> {
    const result = await this.watchlistRepository.delete({ movieId, userId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Watchlist entry not found for movie ${movieId} and user ${userId}`
      );
    }
  }

  async getWatchlist(userId: number): Promise<WatchlistDataDto[]> {
    const watchlist = await this.watchlistRepository.find({
      where: { userId },
      relations: ["movie"],
      order: { createdAt: "DESC" },
    });
    return watchlist.map((item) => this.toDto(item));
  }
}
