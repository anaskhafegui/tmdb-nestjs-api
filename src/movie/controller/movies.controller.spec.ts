import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from "@nestjs/cache-manager";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { Cache } from "cache-manager";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { ListMoviesDto } from "../dto/list-movies.dto";
import { MoviesService } from "../service/movies.service";
import { MoviesController } from "./movies.controller";

describe("MoviesController", () => {
  let controller: MoviesController;
  let service: MoviesService;
  let reflector: Reflector;
  let cacheManager: Cache;

  const mockMoviesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
    reflector = module.get<Reflector>(Reflector);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated movies", async () => {
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

      mockMoviesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(dto);

      expect(service.findAll).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it("should have correct cache metadata", () => {
      const cacheKey = Reflect.getMetadata(
        CACHE_KEY_METADATA,
        controller.findAll
      );
      const cacheTTL = Reflect.getMetadata(
        CACHE_TTL_METADATA,
        controller.findAll
      );

      expect(cacheKey).toBe("movies-list");
      expect(cacheTTL).toBe(3600);
    });
  });

  describe("findOne", () => {
    it("should return a single movie", async () => {
      const id = 1;
      mockMoviesService.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMovie);
    });

    it("should have correct cache metadata", () => {
      const cacheKey = Reflect.getMetadata(
        CACHE_KEY_METADATA,
        controller.findOne
      );
      const cacheTTL = Reflect.getMetadata(
        CACHE_TTL_METADATA,
        controller.findOne
      );

      expect(cacheKey).toBe("movie-detail");
      expect(cacheTTL).toBe(3600);
    });
  });
});
