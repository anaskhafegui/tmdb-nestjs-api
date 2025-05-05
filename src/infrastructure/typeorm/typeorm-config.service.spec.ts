import { Test, TestingModule } from "@nestjs/testing";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { TypeOrmConfigService } from "./typeorm-config.service";

describe("TypeOrmConfigService", () => {
  let service: TypeOrmConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOrmConfigService],
    }).compile();

    service = module.get<TypeOrmConfigService>(TypeOrmConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createTypeOrmOptions", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        POSTGRES_HOST: "localhost",
        POSTGRES_PORT: "5432",
        POSTGRES_USER: "test",
        POSTGRES_PASSWORD: "test",
        POSTGRES_DB: "test_db",
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return TypeORM configuration with environment variables", () => {
      const config =
        service.createTypeOrmOptions() as PostgresConnectionOptions;

      expect(config).toEqual({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "test",
        password: "test",
        database: "test_db",
        entities: expect.arrayContaining([
          expect.stringContaining("entity{.ts,.js}"),
        ]),
        migrations: expect.arrayContaining([
          expect.any(String),
          expect.stringContaining("migrations/**/*.{ts,js}"),
        ]),
        synchronize: false,
        logging: true,
        migrationsTableName: "migrations",
        migrationsRun: true,
      });
    });

    it("should handle missing environment variables with defaults", () => {
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PORT;

      const config =
        service.createTypeOrmOptions() as PostgresConnectionOptions;

      expect(config.host).toBeUndefined();
      expect(config.port).toBeNaN();
      expect(config.username).toBe("test");
      expect(config.password).toBe("test");
      expect(config.database).toBe("test_db");
    });
  });
});
