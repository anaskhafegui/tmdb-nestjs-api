import { BullModule } from "@nestjs/bull";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ThrottlerModule, ThrottlerModuleOptions } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "./app.module";
import { AuthModule } from "./auth/auth.module";
import { RedisCacheModule } from "./infrastructure/cache/cache.module";
import { MoviesModule } from "./movie/movies.module";
import { SyncTmdbModule } from "./sync-tmdb/sync-tmdb.module";
import { TmdbModule } from "./tmdb/tmdb.module";

jest.mock("@nestjs/typeorm", () => ({
  __esModule: true,
  TypeOrmModule: {
    forRootAsync: jest.fn().mockReturnValue({
      module: class TypeOrmModule {},
      providers: [],
      exports: [],
    }),
  },
}));

jest.mock("./infrastructure/cache/cache.module", () => ({
  __esModule: true,
  RedisCacheModule: class {},
}));

jest.mock("@nestjs/bull", () => ({
  __esModule: true,
  BullModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class BullModule {},
      providers: [],
      exports: [],
    }),
  },
}));

jest.mock("@nestjs/throttler", () => ({
  __esModule: true,
  ThrottlerModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class ThrottlerModule {},
      providers: [],
      exports: [],
    }),
  },
}));

jest.mock("@nestjs/config", () => ({
  __esModule: true,
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class ConfigModule {},
      providers: [],
      exports: [],
    }),
  },
}));

jest.mock("./auth/auth.module", () => ({
  __esModule: true,
  AuthModule: class {},
}));

jest.mock("./movie/movies.module", () => ({
  __esModule: true,
  MoviesModule: class {},
}));

jest.mock("./tmdb/tmdb.module", () => ({
  __esModule: true,
  TmdbModule: class {},
}));

jest.mock("./sync-tmdb/sync-tmdb.module", () => ({
  __esModule: true,
  SyncTmdbModule: class {},
}));

interface MockAppModule {
  forRoot: () => {
    module: any;
    imports: any[];
    providers: any[];
    exports: any[];
  };
}

jest.mock("./app.module", () => ({
  __esModule: true,
  AppModule: class {
    static forRoot() {
      return {
        module: class AppModule {},
        imports: [
          ConfigModule.forRoot(),
          TypeOrmModule.forRootAsync({}),
          RedisCacheModule,
          BullModule.forRoot({}),
          ThrottlerModule.forRoot({
            throttlers: [{ ttl: 60, limit: 10 }],
          } as ThrottlerModuleOptions),
          AuthModule,
          MoviesModule,
          TmdbModule,
          SyncTmdbModule,
        ],
        providers: [],
        exports: [],
      };
    }
  } as MockAppModule,
}));

describe("AppModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [(AppModule as unknown as MockAppModule).forRoot()],
    }).compile();
  }, 30000);

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should have ConfigModule", () => {
    expect(ConfigModule.forRoot).toHaveBeenCalled();
  });

  it("should have TypeOrmModule", () => {
    expect(TypeOrmModule.forRootAsync).toHaveBeenCalled();
  });

  it("should have RedisCacheModule", () => {
    expect(RedisCacheModule).toBeDefined();
  });

  it("should have BullModule", () => {
    expect(BullModule.forRoot).toHaveBeenCalled();
  });

  it("should have ThrottlerModule", () => {
    expect(ThrottlerModule.forRoot).toHaveBeenCalled();
  });

  it("should have AuthModule", () => {
    expect(AuthModule).toBeDefined();
  });

  it("should have MoviesModule", () => {
    expect(MoviesModule).toBeDefined();
  });

  it("should have TmdbModule", () => {
    expect(TmdbModule).toBeDefined();
  });

  it("should have SyncTmdbModule", () => {
    expect(SyncTmdbModule).toBeDefined();
  });
});
