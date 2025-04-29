import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { DatabaseModule } from "../infrastructure/typeorm/database.module";
import { GenreRepository } from "../infrastructure/typeorm/repositories/genre.repository";
import { MovieRepository } from "../infrastructure/typeorm/repositories/movie.repository";
import { TmdbModule } from "../tmdb/tmdb.module";
import { SyncTmdbService } from "./sync-tmdb.service";

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, TmdbModule],
  providers: [MovieRepository, GenreRepository, SyncTmdbService],
  exports: [],
})
export class SyncTmdbModule {}
