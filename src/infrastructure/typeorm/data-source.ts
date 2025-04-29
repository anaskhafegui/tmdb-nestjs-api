import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.get<string>("POSTGRES_HOST"),
  port: parseInt(configService.get<string>("POSTGRES_PORT") || "5432", 10),
  username: configService.get<string>("POSTGRES_USER"),
  password: configService.get<string>("POSTGRES_PASSWORD"),
  database: configService.get<string>("POSTGRES_DB"),
  synchronize: false, // Never true in production
  logging: true,
  entities: [join(__dirname, "entities/**/*.entity.{ts,js}")],
  migrations: [join(__dirname, "migrations/**/*.{ts,js}")],
  migrationsTableName: "migrations",
  migrationsRun: false,
} as DataSourceOptions);
