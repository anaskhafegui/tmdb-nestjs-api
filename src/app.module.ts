import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./infrastructure/config/configuration";
import validationSchema from "./infrastructure/config/validation";
import { DatabaseModule } from "./infrastructure/typeorm/database.module";
import { TmdbModule } from "./tmdb/tmdb.module";

Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // Infrastructure
    DatabaseModule,
    // Cache module
    CacheModule,
    // Application modules
    TmdbModule,
  ],
});
export class AppModule {}
