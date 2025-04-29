import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import validationSchema from "./common/config/validation";
import { MoviesModule } from "./movie/movies.module";
import { SyncTmdbModule } from "./sync-tmdb/sync-tmdb.module";
import { TmdbModule } from "./tmdb/tmdb.module";

@Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env", // Explicitly specify the .env file path
      load: [configuration],
      validationSchema,
    }),
    // Infrastructure
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: process.env.NODE_ENV !== "production",
    }),
    // Application modules
    TmdbModule,
    MoviesModule,
    SyncTmdbModule,
  ],
})
export class AppModule {}
