// src/infra/cache/cache.module.ts
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
import { RedisClientProvider } from "./redis.provider";

@Global()
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get<string>("redis.host"),
            port: config.get<number>("redis.port"),
          },
          ttl: config.get<number>("cache.ttl") || 3600,
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [RedisClientProvider],
  exports: [NestCacheModule, "REDIS_CLIENT"],
})
export class CacheModule {}
