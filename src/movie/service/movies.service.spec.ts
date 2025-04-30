import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";
import { MoviesService } from "./movies.service";

describe("MoviesService", () => {
  let service: MoviesService;
  let moviesRepository: Repository<Movie>;
  let cacheManager: Cache;

  const mockMoviesRepository = {
    createQueryBuilder: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockMovie: Movie = {
    id: 1,
    title: "Test Movie",
    overview: "Test Overview",
    posterPath: "/test.jpg",
    releaseDate: new Date(),
    tmdbId: 123,
    avgRating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    genres: [],
    ratings: [],
    watchlistEntries: [],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMoviesRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return cached data when available", async () => {
      const dto: ListMoviesDto = { page: 1, limit: 20 };
      const cachedData = {
        data: [mockMovie],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          previousPage: null,
        },
      };

      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAll(dto);

      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `movies:list:${JSON.stringify(dto)}`
      );
      expect(result).toEqual(cachedData);
    });

    it("should fetch from database when cache is empty", async () => {
      const dto: ListMoviesDto = { page: 1, limit: 20 };
      const expectedResult = {
        data: [mockMovie],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          previousPage: null,
        },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockMovie], 1]);

      const result = await service.findAll(dto);

      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `movies:list:${JSON.stringify(dto)}`
      );
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it("should apply search filter when provided", async () => {
      const dto: ListMoviesDto = { page: 1, limit: 20, search: "test" };

      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockMovie], 1]);

      await service.findAll(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "movie.title ILIKE :search",
        { search: "%test%" }
      );
    });

    it("should apply genre filter when provided", async () => {
      const dto: ListMoviesDto = { page: 1, limit: 20, genre: "Action" };

      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockMovie], 1]);

      await service.findAll(dto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "genre.name = :genre",
        { genre: "Action" }
      );
    });

    it("should handle empty results", async () => {
      const dto: ListMoviesDto = { page: 1, limit: 20 };
      const expectedResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          nextPage: null,
          previousPage: null,
        },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(dto);

      expect(result).toEqual(expectedResult);
    });

    it("should handle pagination correctly", async () => {
      const dto: ListMoviesDto = { page: 2, limit: 10 };
      const expectedResult = {
        data: [mockMovie],
        meta: {
          total: 11,
          page: 2,
          limit: 10,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
          nextPage: null,
          previousPage: 1,
        },
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockMovie], 11]);

      const result = await service.findAll(dto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("findOne", () => {
    it("should return cached movie when available", async () => {
      const id = 1;
      mockCacheManager.get.mockResolvedValue(mockMovie);

      const result = await service.findOne(id);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`movies:${id}`);
      expect(result).toEqual(mockMovie);
    });

    it("should fetch from database when cache is empty", async () => {
      const id = 1;
      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.findOneOrFail.mockResolvedValue(mockMovie);

      const result = await service.findOne(id);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`movies:${id}`);
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual(mockMovie);
    });

    it("should throw NotFoundException when movie not found", async () => {
      const id = 1;
      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.findOneOrFail.mockRejectedValue(new Error());

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it("should handle invalid movie ID", async () => {
      const id = -1;
      mockCacheManager.get.mockResolvedValue(null);
      mockMoviesRepository.findOneOrFail.mockRejectedValue(
        new Error("Not Found")
      );

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("clearCache", () => {
    it("should clear movie-related caches", async () => {
      await service.clearCache();

      expect(mockCacheManager.del).toHaveBeenCalledWith("movies-list");
      expect(mockCacheManager.del).toHaveBeenCalledWith("movie-detail");
    });
  });
});
