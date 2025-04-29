import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DataSource } from "typeorm";

import { SyncErrorLog } from "../infrastructure/typeorm/entities/sync-error-log.entity";
import {
  ErrorType,
  SyncJob,
  SyncStatus,
} from "../infrastructure/typeorm/entities/sync-job.entity";
import { GenreRepository } from "../infrastructure/typeorm/repositories/genre.repository";
import { MovieRepository } from "../infrastructure/typeorm/repositories/movie.repository";
import { ITmdbClient } from "../tmdb/interfaces/itmdb-client.interface";

@Injectable()
export class SyncTmdbService {
  private readonly logger = new Logger(SyncTmdbService.name);

  constructor(
    @Inject("ITmdbClient")
    private readonly tmdbClient: ITmdbClient,
    private readonly movieRepo: MovieRepository,
    private readonly genreRepo: GenreRepository,
    private readonly dataSource: DataSource
  ) {}

  @Cron("0 2 * * *") // Daily at 02:00
  async handleCron() {
    const syncJobRepo = this.dataSource.getRepository(SyncJob);
    const errorRepo = this.dataSource.getRepository(SyncErrorLog);

    let job = await syncJobRepo.findOne({ where: { jobName: "tmdb-popular" } });
    if (!job) job = syncJobRepo.create({ jobName: "tmdb-popular" });
    job.status = SyncStatus.IN_PROGRESS;
    await syncJobRepo.save(job);

    // 1) Sync genres (best-effort)
    try {
      const genres = await this.tmdbClient.fetchGenres();
      const genreBatch = genres.map((g) => ({ tmdbId: g.id, name: g.name }));
      await this.genreRepo.upsertMany(genreBatch);
    } catch (err) {
      this.logger.error("Failed to sync genres", err.stack || err);
    }

    const TOTAL_PAGES = 500;

    for (let page = job.lastPageSynced + 1; page <= TOTAL_PAGES; page++) {
      try {
        const movies = await this.tmdbClient.fetchPopular(page);
        const movieBatch = movies.map((m) => ({
          tmdbId: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path,
          releaseDate: m.release_date,
        }));

        await this.movieRepo.upsertMany(movieBatch);

        job.lastPageSynced = page;
        job.status = SyncStatus.IN_PROGRESS;
        job.lastErrorType = null;
        job.lastErrorMessage = null;
        job.lastErrorCode = null;
        await syncJobRepo.save(job);
      } catch (err) {
        let type = ErrorType.UNKNOWN;
        let code: number = null;
        const message = err.message;

        if (err.response?.status) {
          type = ErrorType.PROVIDER;
          code = err.response.status;
        } else {
          type = ErrorType.NETWORK;
        }

        this.logger.error(`Sync failed on page ${page}: ${message}`);

        job.status = SyncStatus.FAILED;
        job.lastErrorType = type;
        job.lastErrorMessage = message;
        job.lastErrorCode = code;
        await syncJobRepo.save(job);

        const errorLog = errorRepo.create({
          job,
          page,
          errorType: type,
          message,
          code,
        });
        await errorRepo.save(errorLog);

        return; // abort on first error
      }
    }

    job.status = SyncStatus.COMPLETED;
    await syncJobRepo.save(job);
    this.logger.log("TMDB sync completed successfully");
  }
}
