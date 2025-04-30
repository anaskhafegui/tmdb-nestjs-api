import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue("test-secret"),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ratings: [],
    watchlist: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validate", () => {
    const payload = { sub: 1, email: "test@example.com" };

    it("should return user if valid payload", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub, isActive: true },
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub, isActive: true },
      });
    });

    it("should throw UnauthorizedException if user is not active", async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub, isActive: true },
      });
    });
  });
});
