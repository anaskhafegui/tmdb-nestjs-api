// src/infra/cache/redis.provider.ts
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

export const RedisClientProvider = {
  provide: "REDIS_CLIENT",
  useFactory: async (config: ConfigService) => {
    const client = createClient({
      socket: {
        host: config.get<string>("redis.host"),
        port: config.get<number>("redis.port"),
      },
      // if your Redis requires auth, uncomment:
      // password: config.get<string>('redis.password'),
    });

    client.on("error", (err) => console.error("Redis Client Error", err));
    await client.connect();
    return client;
  },
  inject: [ConfigService],
};
