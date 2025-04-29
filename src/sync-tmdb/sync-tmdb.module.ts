import { HttpModule } from "@nestjs/axios";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "../infrastructure/typeorm/database.module";
import { Genre } from "../infrastructure/typeorm/entities/genre.entity";
import { Movie } from "../infrastructure/typeorm/entities/movie.entity";
import { SyncErrorLog } from "../infrastructure/typeorm/entities/sync-error-log.entity";
import { SyncJob } from "../infrastructure/typeorm/entities/sync-job.entity";
import { TmdbModule } from "../tmdb/tmdb.module";
import { TmdbService } from "../tmdb/tmdb.service";
import { SyncTmdbController } from "./sync-tmdb.controller";
import { SyncTmdbProcessor } from "./sync-tmdb.processor";
import { SyncTmdbService } from "./sync-tmdb.service";

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    TmdbModule,
    TypeOrmModule.forFeature([Movie, Genre, SyncJob, SyncErrorLog]),
    BullModule.registerQueue({
      name: "tmdb-sync",
      limiter: {
        max: 10, // Maximum number of jobs processed
        duration: 1000, // Per duration in milliseconds
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [
    {
      provide: "ITmdbClient",
      useClass: TmdbService,
    },
    SyncTmdbService,
    SyncTmdbProcessor,
  ],
  controllers: [SyncTmdbController],
  exports: [SyncTmdbService],
})
export class SyncTmdbModule {}
