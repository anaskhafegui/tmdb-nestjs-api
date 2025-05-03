import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { TmdbService } from "./tmdb.service";

describe("TmdbService", () => {
  let service: TmdbService;
  let configService: ConfigService;
  let mockHttpService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockHttpService = {
      get: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn().mockReturnValue("test-api-key"),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchPopular", () => {
    it("should fetch popular movies", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          results: [
            {
              id: 1,
              title: "Test Movie",
              overview: "Test Overview",
              poster_path: "/test.jpg",
              release_date: "2024-01-01",
              vote_average: 8.5,
            },
          ],
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchPopular(1);
      expect(result).toEqual(mockResponse.data.results);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/movie/popular",
        { params: { api_key: "test-api-key", page: 1 } }
      );
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            status_message: "Invalid API key",
          },
        },
      };

      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(service.fetchPopular(1)).rejects.toThrow("Invalid API key");
    });

    it("should handle malformed response data", async () => {
      const mockResponse: AxiosResponse = {
        data: null,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await expect(service.fetchPopular(1)).rejects.toThrow(
        "Invalid response format from TMDB API"
      );
    });
  });

  describe("fetchGenres", () => {
    it("should fetch movie genres", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          genres: [
            { id: 1, name: "Action" },
            { id: 2, name: "Comedy" },
          ],
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchGenres();
      expect(result).toEqual(mockResponse.data.genres);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        "https://api.themoviedb.org/3/genre/movie/list",
        { params: { api_key: "test-api-key" } }
      );
    });

    it("should handle invalid API keys", async () => {
      mockConfigService.get.mockReturnValue(null);
      service = new TmdbService(mockHttpService, mockConfigService);

      await expect(service.fetchGenres()).rejects.toThrow(
        "TMDB API key is not configured"
      );
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            status_message: "Invalid API key",
          },
        },
      };

      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(service.fetchGenres()).rejects.toThrow("Invalid API key");
    });

    it("should handle malformed response data", async () => {
      const mockResponse: AxiosResponse = {
        data: null,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await expect(service.fetchGenres()).rejects.toThrow(
        "Invalid response format from TMDB API"
      );
    });
  });
});
