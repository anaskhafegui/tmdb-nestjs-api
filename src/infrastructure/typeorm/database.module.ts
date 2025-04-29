// src/infra/typeorm/database.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Genre } from "./entities/genre.entity";
import { Movie } from "./entities/movie.entity";
import { SyncErrorLog } from "./entities/sync-error-log.entity";
import { SyncJob } from "./entities/sync-job.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: false,
      synchronize: false, // Disable in production
    }),
    // TypeOrmModule.forRoot({
    //   ...AppDataSource.options,
    // }),
    TypeOrmModule.forFeature([Movie, Genre, SyncJob, SyncErrorLog]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
