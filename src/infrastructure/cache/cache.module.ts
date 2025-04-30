// src/infra/cache/cache.module.ts
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        ttl: 60 * 60 * 24, // 24 hours
        max: 100, // maximum number of items in cache
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
