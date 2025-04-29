import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "./common/config/configuration";
import validationSchema from "./common/config/validation";
import { TypeOrmConfigService } from "./infrastructure/typeorm/typeorm-config.service";
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
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || "0", 10),
      },
    }),
    // Application modules
    TmdbModule,
    MoviesModule,
    SyncTmdbModule,
  ],
})
export class AppModule {}
