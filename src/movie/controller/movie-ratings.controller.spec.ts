import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../infrastructure/typeorm/entities/user.entity";
import { RateMovieDto } from "../dto/rate-movie.dto";
import { MovieRatingsService } from "../service/movie-ratings.service";
import { MovieRatingsController } from "./movie-ratings.controller";

describe("MovieRatingsController", () => {
  let controller: MovieRatingsController;
  let movieRatingsService: MovieRatingsService;

  const mockMovieRatingsService = {
    rateMovie: jest.fn(),
    getUserRating: jest.fn(),
    deleteRating: jest.fn(),
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

  const mockRating = {
    id: 1,
    rating: 4,
    comment: "Great movie!",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    movieId: 1,
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
      controllers: [MovieRatingsController],
      providers: [
        {
          provide: MovieRatingsService,
          useValue: mockMovieRatingsService,
        },
      ],
    }).compile();

    controller = module.get<MovieRatingsController>(MovieRatingsController);
    movieRatingsService = module.get<MovieRatingsService>(MovieRatingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rateMovie", () => {
    it("should create a new rating", async () => {
      const movieId = 1;
      const rateMovieDto: RateMovieDto = {
        rating: 4,
        comment: "Great movie!",
      };

      mockMovieRatingsService.rateMovie.mockResolvedValue(mockRating);

      const result = await controller.rateMovie(
        movieId,
        mockUser,
        rateMovieDto
      );

      expect(movieRatingsService.rateMovie).toHaveBeenCalledWith(
        movieId,
        mockUser.id,
        rateMovieDto
      );
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe("Rating created successfully");
      expect(result.data).toEqual(mockRating);
    });
  });

  describe("getUserRating", () => {
    it("should return user rating for a movie", async () => {
      const movieId = 1;

      mockMovieRatingsService.getUserRating.mockResolvedValue(mockRating);

      const result = await controller.getUserRating(movieId, mockUser);

      expect(movieRatingsService.getUserRating).toHaveBeenCalledWith(
        movieId,
        mockUser.id
      );
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe("Rating retrieved successfully");
      expect(result.data).toEqual(mockRating);
    });
  });

  describe("deleteRating", () => {
    it("should delete a rating", async () => {
      const movieId = 1;

      mockMovieRatingsService.deleteRating.mockResolvedValue(undefined);

      await controller.deleteRating(movieId, mockUser);

      expect(movieRatingsService.deleteRating).toHaveBeenCalledWith(
        movieId,
        mockUser.id
      );
    });
  });
});
