import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Watchlist } from "../../infrastructure/typeorm/entities/watchlist.entity";
import { PaginatedResponseDto } from "../dto/paginated-response.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { WatchlistDataDto } from "../dto/watchlist-data.dto";
import { WatchlistDto } from "../dto/watchlist.dto";

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
    userId: number,
    watchlistDto: WatchlistDto
  ): Promise<WatchlistDataDto> {
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

  async getWatchlist(
    userId: number,
    paginationDto: PaginationDto
  ): Promise<PaginatedResponseDto<WatchlistDataDto>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [watchlist, total] = await this.watchlistRepository.findAndCount({
      where: { userId },
      relations: ["movie"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      statusCode: 200,
      message: "Watchlist retrieved successfully",
      data: watchlist.map((item) => this.toDto(item)),
      page,
      limit,
      total,
      totalPages,
    };
  }
}
