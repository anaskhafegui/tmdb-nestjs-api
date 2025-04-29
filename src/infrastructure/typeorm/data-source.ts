// src/infra/typeorm/data-source.ts
import { join } from "path";
import { DataSource } from "typeorm";
import { Genre } from "./entities/genre.entity";
import { Movie } from "./entities/movie.entity";
import { SyncErrorLog } from "./entities/sync-error-log.entity";
import { SyncJob } from "./entities/sync-job.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // Disable in production
  entities: [
    Movie,
    Genre,
    SyncJob,
    SyncErrorLog,
    // add other entities here
  ],
  migrations: [join(__dirname, "migrations/*.{ts,js}")],
  logging: true,
});
