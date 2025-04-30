import { BullModule } from "@nestjs/bull";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import configuration from "./common/config/configuration";
import validationSchema from "./common/config/validation";
import { SanitizeMiddleware } from "./common/middleware/sanitize.middleware";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { RedisCacheModule } from "./infrastructure/cache/cache.module";
import { TypeOrmConfigService } from "./infrastructure/typeorm/typeorm-config.service";
import { MoviesModule } from "./movie/movies.module";
import { SyncTmdbModule } from "./sync-tmdb/sync-tmdb.module";
import { TmdbModule } from "./tmdb/tmdb.module";

@Module({
  imports: [
    // Environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.development", ".env.production"],
      load: [configuration],
      validationSchema,
    }),
    // Infrastructure
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RedisCacheModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || "0", 10),
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    // Application modules
    AuthModule,
    MoviesModule,
    TmdbModule,
    SyncTmdbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware, SanitizeMiddleware).forRoutes("*");
  }
}
