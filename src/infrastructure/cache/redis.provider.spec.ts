import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { RedisClientProvider } from "./redis.provider";

jest.mock("redis", () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("RedisClientProvider", () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const config = {
          "redis.host": "localhost",
          "redis.port": 6379,
        };
        return config[key];
      }),
    } as any;

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(RedisClientProvider).toBeDefined();
    expect(RedisClientProvider.provide).toBe("REDIS_CLIENT");
  });

  it("should create Redis client with correct configuration", async () => {
    const client = await RedisClientProvider.useFactory(configService);

    expect(createClient).toHaveBeenCalledWith({
      socket: {
        host: "localhost",
        port: 6379,
      },
    });

    expect(client.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(client.connect).toHaveBeenCalled();
  });

  it("should handle Redis client errors", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const mockClient = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === "error") {
          callback(new Error("Redis connection error"));
        }
      }),
      connect: jest.fn().mockResolvedValue(undefined),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    await RedisClientProvider.useFactory(configService);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Redis Client Error",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should inject ConfigService", () => {
    expect(RedisClientProvider.inject).toContain(ConfigService);
  });
});
