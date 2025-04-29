// src/infra/typeorm/repositories/genre.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Genre } from "../entities/genre.entity";

@Injectable()
export class GenreRepository {
  constructor(
    @InjectRepository(Genre)
    private readonly repo: Repository<Genre>
  ) {}

  async upsertMany(batch: Partial<Genre>[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Genre)
      .values(batch)
      .onConflict(
        `("tmdb_id") DO UPDATE SET name = EXCLUDED.name, updated_at = now()`
      )
      .execute();
  }
}
