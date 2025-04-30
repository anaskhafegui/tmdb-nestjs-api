import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { TmdbController } from "./tmdb.controller";
import { TmdbService } from "./tmdb.service";

describe("TmdbController", () => {
  let controller: TmdbController;
  let service: TmdbService;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockHttpService = {
      get: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn().mockReturnValue("test-api-key"),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmdbController],
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

    controller = module.get<TmdbController>(TmdbController);
    service = module.get<TmdbService>(TmdbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getPopularMovies", () => {
    it("should return popular movies", async () => {
      const mockMovies = [
        {
          id: 1,
          title: "Test Movie",
          overview: "Test Overview",
          poster_path: "/test.jpg",
          release_date: "2024-01-01",
          vote_average: 8.5,
        },
      ];

      const mockResponse: AxiosResponse = {
        data: {
          results: mockMovies,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await controller.getPopularMovies({ page: 1 });
      expect(result).toEqual({
        status_code: 200,
        message: "Success",
        result: mockMovies,
      });
    });

    it("should handle empty results", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          results: [],
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await controller.getPopularMovies({ page: 1 });
      expect(result).toEqual({
        status_code: 200,
        message: "Success",
        result: [],
      });
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(controller.getPopularMovies({ page: 1 })).rejects.toThrow(
        "API Error"
      );
    });

    it("should handle invalid page numbers", async () => {
      await expect(controller.getPopularMovies({ page: -1 })).rejects.toThrow(
        "Page number must be positive"
      );
    });

    it("should handle network errors", async () => {
      const error = new Error("Network Error");
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(controller.getPopularMovies({ page: 1 })).rejects.toThrow(
        "Network Error"
      );
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

      await expect(controller.getPopularMovies({ page: 1 })).rejects.toThrow(
        "Invalid response format from TMDB API"
      );
    });
  });

  describe("getGenres", () => {
    it("should return movie genres", async () => {
      const mockGenres = [
        { id: 1, name: "Action" },
        { id: 2, name: "Comedy" },
      ];

      const mockResponse: AxiosResponse = {
        data: {
          genres: mockGenres,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await controller.getGenres();
      expect(result).toEqual({
        status_code: 200,
        message: "Success",
        result: mockGenres,
      });
    });

    it("should handle empty genre list", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          genres: [],
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await controller.getGenres();
      expect(result).toEqual({
        status_code: 200,
        message: "Success",
        result: [],
      });
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(controller.getGenres()).rejects.toThrow("API Error");
    });

    it("should handle invalid API key", async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            status_message: "Invalid API key",
          },
        },
      };

      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(controller.getGenres()).rejects.toThrow("Invalid API key");
    });

    it("should handle network errors", async () => {
      const error = new Error("Network Error");
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(controller.getGenres()).rejects.toThrow("Network Error");
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

      await expect(controller.getGenres()).rejects.toThrow(
        "Invalid response format from TMDB API"
      );
    });
  });
});
