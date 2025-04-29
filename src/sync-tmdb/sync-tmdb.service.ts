import { InjectQueue } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { DataSource, Repository } from "typeorm";

import { Genre } from "../infrastructure/typeorm/entities/genre.entity";
import { Movie } from "../infrastructure/typeorm/entities/movie.entity";
import { SyncErrorLog } from "../infrastructure/typeorm/entities/sync-error-log.entity";
import {
  ErrorType,
  SyncJob,
  SyncStatus,
} from "../infrastructure/typeorm/entities/sync-job.entity";
import { ITmdbClient } from "../tmdb/interfaces/itmdb-client.interface";

@Injectable()
export class SyncTmdbService {
  private readonly logger = new Logger(SyncTmdbService.name);
  private readonly BATCH_SIZE = 5; // Number of pages to process in parallel
  private readonly MOVIE_BATCH_SIZE = 50; // Number of movies to process in a single transaction

  constructor(
    @Inject("ITmdbClient")
    private readonly tmdbClient: ITmdbClient,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectQueue("tmdb-sync")
    private readonly syncQueue: Queue,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly dataSource: DataSource
  ) {}

  @Cron("0 2 * * *") // Daily at 02:00
  async handleCron() {
    const syncJobRepo = this.dataSource.getRepository(SyncJob);
    let job = await syncJobRepo.findOne({ where: { jobName: "tmdb-popular" } });
    if (!job) job = syncJobRepo.create({ jobName: "tmdb-popular" });
    job.status = SyncStatus.IN_PROGRESS;
    await syncJobRepo.save(job);

    // Sync genres first
    try {
      const genres = await this.tmdbClient.fetchGenres();
      const genreBatch = genres.map((g) => ({ tmdbId: g.id, name: g.name }));
      await this.genreRepo.upsert(genreBatch, ["tmdbId"]);
    } catch (err) {
      this.logger.error("Failed to sync genres", err.stack || err);
    }

    const TOTAL_PAGES = 500;
    const startPage = job.lastPageSynced + 1;

    // Add jobs to queue
    for (
      let batchStart = startPage;
      batchStart <= TOTAL_PAGES;
      batchStart += this.BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + this.BATCH_SIZE - 1, TOTAL_PAGES);
      await this.syncQueue.add("process-batch", {
        batchStart,
        batchEnd,
        jobId: job.id,
      });
    }
  }

  async processBatch(data: {
    batchStart: number;
    batchEnd: number;
    jobId: number;
  }) {
    const { batchStart, batchEnd, jobId } = data;
    const syncJobRepo = this.dataSource.getRepository(SyncJob);
    const errorRepo = this.dataSource.getRepository(SyncErrorLog);
    const job = await syncJobRepo.findOne({ where: { id: jobId } });

    this.logger.log(`Processing pages ${batchStart} to ${batchEnd}`);

    try {
      // Fetch all pages in the batch in parallel
      const pagePromises = Array.from(
        { length: batchEnd - batchStart + 1 },
        (_, i) => this.tmdbClient.fetchPopular(batchStart + i)
      );
      const moviesResults = await Promise.all(pagePromises);
      const allMovies = moviesResults.flat();

      // Process movies in smaller batches
      for (let i = 0; i < allMovies.length; i += this.MOVIE_BATCH_SIZE) {
        const movieBatch = allMovies.slice(i, i + this.MOVIE_BATCH_SIZE);

        await this.dataSource.transaction(async (manager) => {
          // Upsert movies
          const movieEntities = movieBatch.map((m) => ({
            tmdbId: m.id,
            title: m.title,
            overview: m.overview,
            posterPath: m.poster_path,
            releaseDate: m.release_date || null,
          }));
          await manager.getRepository(Movie).upsert(movieEntities, ["tmdbId"]);

          // Process movie-genre relationships
          for (const movie of movieBatch) {
            if (movie.genre_ids && movie.genre_ids.length > 0) {
              const movieEntity = await manager.getRepository(Movie).findOne({
                where: { tmdbId: movie.id },
                relations: ["genres"],
              });

              if (movieEntity) {
                const genres = await manager
                  .getRepository(Genre)
                  .createQueryBuilder("genre")
                  .where("genre.tmdbId IN (:...ids)", {
                    ids: movie.genre_ids,
                  })
                  .getMany();

                movieEntity.genres = genres;
                await manager.getRepository(Movie).save(movieEntity);
              }
            }
          }
        });
      }

      job.lastPageSynced = batchEnd;
      job.status = SyncStatus.IN_PROGRESS;
      job.lastErrorType = null;
      job.lastErrorMessage = null;
      job.lastErrorCode = null;
      await syncJobRepo.save(job);

      // Clear the cache after successful batch processing
      await this.clearCache();

      this.logger.log(
        `Completed processing pages ${batchStart} to ${batchEnd}`
      );
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

      this.logger.error(
        `Sync failed on batch ${batchStart}-${batchEnd}: ${message}`
      );

      job.status = SyncStatus.FAILED;
      job.lastErrorType = type;
      job.lastErrorMessage = message;
      job.lastErrorCode = code;
      await syncJobRepo.save(job);

      const errorLog = errorRepo.create({
        job,
        page: batchStart,
        errorType: type,
        message,
        code,
      });
      await errorRepo.save(errorLog);

      throw err; // Re-throw to trigger job retry
    }
  }

  private async clearCache(): Promise<void> {
    try {
      // Clear all movie-related caches
      await this.cacheManager.del("movies-list");
      await this.cacheManager.del("movie-detail");
      this.logger.log("Successfully cleared movie caches");
    } catch (error) {
      this.logger.error("Failed to clear cache", error.stack || error);
    }
  }
}
