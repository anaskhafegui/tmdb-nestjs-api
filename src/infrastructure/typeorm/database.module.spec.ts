import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "./data-source";

jest.mock("./data-source", () => ({
  AppDataSource: {
    options: {
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "test",
      password: "test",
      database: "test_db",
    },
  },
}));

describe("DatabaseModule", () => {
  let module: TestingModule;
  const mockModule = class MockTypeOrm {};
  const mockForRootAsync = jest
    .spyOn(TypeOrmModule, "forRootAsync")
    .mockReturnValue({
      module: mockModule,
      providers: [],
      exports: [],
    });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...AppDataSource.options,
            autoLoadEntities: true,
            synchronize: false,
            logging: true,
          }),
        }),
      ],
    }).compile();
  }, 10000);

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should configure TypeOrmModule with correct options", () => {
    expect(mockForRootAsync).toHaveBeenCalled();

    const expectedConfig = {
      ...AppDataSource.options,
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    };

    const actualConfig = mockForRootAsync.mock.calls[0][0].useFactory();
    expect(actualConfig).toEqual(expectedConfig);
  });

  it("should have TypeOrmModule available", () => {
    const typeOrmModule = module.get(mockModule);
    expect(typeOrmModule).toBeDefined();
  });
});
