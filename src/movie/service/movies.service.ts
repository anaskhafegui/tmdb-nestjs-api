import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";

import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";
import { PaginationResponse } from "../interfaces/pagination.interface";

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepo: Repository<Movie>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async findAll(dto: ListMoviesDto): Promise<PaginationResponse<Movie>> {
    const { page = 1, limit = 20, search, genre } = dto;
    const cacheKey = `movies:list:${JSON.stringify(dto)}`;
    const cachedData = await this.cacheManager.get<PaginationResponse<Movie>>(
      cacheKey
    );

    if (cachedData) {
      return cachedData;
    }

    const qb = this.moviesRepo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.genres", "genre");

    if (search) {
      qb.andWhere("movie.title ILIKE :search", { search: `%${search}%` });
    }
    if (genre) {
      qb.andWhere("genre.name = :genre", { genre });
    }

    const [movies, total] = await qb
      .orderBy("movie.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response: PaginationResponse<Movie> = {
      data: movies,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
      },
    };

    await this.cacheManager.set(cacheKey, response);
    return response;
  }

  async findOne(id: number): Promise<Movie> {
    const cacheKey = `movies:${id}`;
    const cachedMovie = await this.cacheManager.get<Movie>(cacheKey);

    if (cachedMovie) {
      return cachedMovie;
    }

    try {
      const movie = await this.moviesRepo.findOneOrFail({
        where: { id },
        relations: ["genres"],
      });
      await this.cacheManager.set(cacheKey, movie);
      return movie;
    } catch (error) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }

  // Add a method to clear cache when movies are updated
  async clearCache(): Promise<void> {
    // Clear all movie-related caches
    await this.cacheManager.del("movies-list");
    await this.cacheManager.del("movie-detail");
  }
}
