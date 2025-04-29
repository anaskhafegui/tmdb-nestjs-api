import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Genre } from "../../infrastructure/typeorm/entities/genre.entity";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";
import { PaginationResponse } from "../interfaces/pagination.interface";

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepo: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genresRepo: Repository<Genre>
  ) {}

  async findAll(dto: ListMoviesDto): Promise<PaginationResponse<Movie>> {
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

    const [movies, total] = await qb
      .orderBy("movie.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
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
  }

  async findOne(id: number): Promise<Movie> {
    try {
      return await this.moviesRepo.findOneOrFail({
        where: { id },
        relations: ["genres"],
      });
    } catch (error) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }
}
