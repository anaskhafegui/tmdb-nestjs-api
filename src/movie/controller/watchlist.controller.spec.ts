import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { WatchlistDataDto } from "../dto/watchlist-data.dto";
import { WatchlistService } from "../service/watchlist.service";
import { WatchlistController } from "./watchlist.controller";

describe("WatchlistController", () => {
  let controller: WatchlistController;
  let watchlistService: WatchlistService;

  const mockWatchlistService = {
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getWatchlist: jest.fn(),
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

  const mockWatchlistData: WatchlistDataDto = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    movie: {
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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
    watchlistService = module.get<WatchlistService>(WatchlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addToWatchlist", () => {
    it("should add a movie to watchlist and return WatchlistResponseDto", async () => {
      const movieId = "1";
      mockWatchlistService.addToWatchlist.mockResolvedValue(mockWatchlistData);

      const result = await controller.addToWatchlist(movieId, mockUser);

      expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(
        parseInt(movieId, 10),
        mockUser.id
      );
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe("Movie added to watchlist successfully");
      expect(result.data).toEqual([mockWatchlistData]);
    });

    it("should handle errors from service", async () => {
      const movieId = "1";
      const error = new Error("Test error");
      mockWatchlistService.addToWatchlist.mockRejectedValue(error);

      await expect(
        controller.addToWatchlist(movieId, mockUser)
      ).rejects.toThrow(error);
    });
  });

  describe("removeFromWatchlist", () => {
    it("should remove a movie from watchlist", async () => {
      const movieId = "1";
      mockWatchlistService.removeFromWatchlist.mockResolvedValue(undefined);

      await controller.removeFromWatchlist(movieId, mockUser);

      expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith(
        parseInt(movieId, 10),
        mockUser.id
      );
    });

    it("should handle errors from service", async () => {
      const movieId = "1";
      const error = new Error("Test error");
      mockWatchlistService.removeFromWatchlist.mockRejectedValue(error);

      await expect(
        controller.removeFromWatchlist(movieId, mockUser)
      ).rejects.toThrow(error);
    });
  });

  describe("getWatchlist", () => {
    it("should return user watchlist as WatchlistResponseDto", async () => {
      mockWatchlistService.getWatchlist.mockResolvedValue([mockWatchlistData]);

      const result = await controller.getWatchlist(mockUser);

      expect(mockWatchlistService.getWatchlist).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Watchlist retrieved successfully");
      expect(result.data).toEqual([mockWatchlistData]);
    });

    it("should return empty watchlist when user has no movies", async () => {
      mockWatchlistService.getWatchlist.mockResolvedValue([]);

      const result = await controller.getWatchlist(mockUser);

      expect(mockWatchlistService.getWatchlist).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Watchlist retrieved successfully");
      expect(result.data).toEqual([]);
    });

    it("should handle errors from service", async () => {
      const error = new Error("Test error");
      mockWatchlistService.getWatchlist.mockRejectedValue(error);

      await expect(controller.getWatchlist(mockUser)).rejects.toThrow(error);
    });
  });
});
