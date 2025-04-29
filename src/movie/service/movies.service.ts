import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";

import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepo: Repository<Movie>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}

  async findAll(dto: ListMoviesDto): Promise<Movie[]> {
    const cacheKey = `movies:list:${JSON.stringify(dto)}`;
    const cachedData = await this.cacheManager.get<Movie[]>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const { page = 1, limit = 20, search, genre } = dto;
    const qb = this.moviesRepo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.genres", "genre");

    if (search) {
      qb.andWhere("movie.title ILIKE :search", { search: `%${search}%` });
    }
    if (genre) {
      qb.andWhere("genre.name = :genre", { genre });
    }

    const movies = await qb
      .orderBy("movie.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    await this.cacheManager.set(cacheKey, movies);
    return movies;
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
