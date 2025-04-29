// src/infra/typeorm/repositories/movie.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "../entities/movie.entity";

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repo: Repository<Movie>
  ) {}

  async findWithFilters(filters: {
    page: number;
    limit: number;
    genre?: string;
    search?: string;
  }): Promise<Movie[]> {
    const qb = this.repo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.genres", "genre");

    if (filters.search) {
      qb.andWhere("movie.title ILIKE :search", {
        search: `%${filters.search}%`,
      });
    }
    if (filters.genre) {
      qb.andWhere("genre.name = :genre", { genre: filters.genre });
    }

    qb.skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .orderBy("movie.created_at", "DESC");

    return qb.getMany();
  }

  async findById(id: number): Promise<Movie> {
    return this.repo.findOneOrFail({ where: { id }, relations: ["genres"] });
  }

  async updateAvgRating(id: number, avg: number): Promise<void> {
    await this.repo.update({ id }, { avgRating: avg });
  }

  async upsertMany(batch: Partial<Movie>[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values(batch)
      .onConflict(
        `("tmdb_id") DO UPDATE SET \
         title = EXCLUDED.title, \
         overview = EXCLUDED.overview, \
         poster_path = EXCLUDED.poster_path, \
         release_date = EXCLUDED.release_date, \
         updated_at = now()`
      )
      .execute();
  }
}
