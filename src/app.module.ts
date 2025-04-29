import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import configuration from "./common/config/configuration";
import validationSchema from "./common/config/validation";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { DatabaseModule } from "./infrastructure/typeorm/database.module";
import { MoviesModule } from "./movie/movies.module";
import { TmdbModule } from "./tmdb/tmdb.module";

console.log("DatabaseModule has been imported");

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
    DatabaseModule,
    // Cache module
    CacheModule,
    // Application modules
    TmdbModule,
    MoviesModule,
  ],
})
export class AppModule {}
