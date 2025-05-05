import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Watchlist } from "../../infrastructure/typeorm/entities/watchlist.entity";
import { WatchlistDataDto } from "../dto/watchlist-data.dto";
import { WatchlistService } from "./watchlist.service";

describe("WatchlistService", () => {
  let service: WatchlistService;
  let watchlistRepository: Repository<Watchlist>;

  const mockWatchlistRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockWatchlist: Watchlist = {
    id: 1,
    movieId: 1,
    userId: 1,
    isFavorite: false,
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
    user: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getRepositoryToken(Watchlist),
          useValue: mockWatchlistRepository,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    watchlistRepository = module.get<Repository<Watchlist>>(
      getRepositoryToken(Watchlist)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addToWatchlist", () => {
    it("should add a movie to watchlist and return WatchlistDataDto", async () => {
      const movieId = 10;
      const userId = 1;

      mockWatchlistRepository.findOne.mockImplementationOnce(() =>
        Promise.resolve(null)
      );
      mockWatchlistRepository.findOne.mockImplementationOnce(() =>
        Promise.resolve(mockWatchlist)
      );

      mockWatchlistRepository.create.mockReturnValue(mockWatchlist);
      mockWatchlistRepository.save.mockResolvedValue(mockWatchlist);

      const result = await service.addToWatchlist(movieId, userId);

      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { movieId, userId },
      });
      expect(mockWatchlistRepository.create).toHaveBeenCalledWith({
        movieId,
        userId,
      });
      expect(mockWatchlistRepository.save).toHaveBeenCalledWith(mockWatchlist);
      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockWatchlist.id },
        relations: ["movie"],
      });
      expect(result).toBeInstanceOf(WatchlistDataDto);
      expect(result.id).toBe(mockWatchlist.id);
    });

    it("should throw ConflictException when movie is already in watchlist", async () => {
      const movieId = 1;
      const userId = 1;

      mockWatchlistRepository.findOne.mockResolvedValue(mockWatchlist);

      await expect(service.addToWatchlist(movieId, userId)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("removeFromWatchlist", () => {
    it("should remove a movie from watchlist", async () => {
      const movieId = 1;
      const userId = 1;

      mockWatchlistRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeFromWatchlist(movieId, userId);

      expect(mockWatchlistRepository.delete).toHaveBeenCalledWith({
        movieId,
        userId,
      });
    });

    it("should throw NotFoundException when watchlist entry not found", async () => {
      const movieId = 1;
      const userId = 1;

      mockWatchlistRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.removeFromWatchlist(movieId, userId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getWatchlist", () => {
    it("should return user watchlist as WatchlistDataDto array", async () => {
      const userId = 1;

      mockWatchlistRepository.find.mockResolvedValue([mockWatchlist]);

      const result = await service.getWatchlist(userId);

      expect(mockWatchlistRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ["movie"],
        order: { createdAt: "DESC" },
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(WatchlistDataDto);
      expect(result[0].id).toBe(mockWatchlist.id);
    });

    it("should return empty array when user has no watchlist", async () => {
      const userId = 1;

      mockWatchlistRepository.find.mockResolvedValue([]);

      const result = await service.getWatchlist(userId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
