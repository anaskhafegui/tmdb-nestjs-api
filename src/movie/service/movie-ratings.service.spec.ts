import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MovieRating } from "../../infrastructure/typeorm/entities/movie-rating.entity";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { RateMovieDto } from "../dto/rate-movie.dto";
import { MovieRatingsService } from "./movie-ratings.service";

describe("MovieRatingsService", () => {
  let service: MovieRatingsService;
  let movieRatingRepository: Repository<MovieRating>;
  let movieRepository: Repository<Movie>;

  const mockMovieRatingRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
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

  const mockRating: MovieRating = {
    id: 1,
    rating: 4,
    comment: "Great movie!",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    movieId: 1,
    movie: mockMovie,
    user: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieRatingsService,
        {
          provide: getRepositoryToken(MovieRating),
          useValue: mockMovieRatingRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MovieRatingsService>(MovieRatingsService);
    movieRatingRepository = module.get<Repository<MovieRating>>(
      getRepositoryToken(MovieRating)
    );
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rateMovie", () => {
    const movieId = 1;
    const userId = 1;
    const rateMovieDto: RateMovieDto = {
      rating: 4,
      comment: "Great movie!",
    };

    it("should create a new rating if one does not exist", async () => {
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockMovieRatingRepository.findOne.mockResolvedValue(null);
      mockMovieRatingRepository.create.mockReturnValue(mockRating);
      mockMovieRatingRepository.save.mockResolvedValue(mockRating);
      mockMovieRatingRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue({ avgRating: "4.0" });

      const result = await service.rateMovie(movieId, userId, rateMovieDto);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(mockMovieRatingRepository.create).toHaveBeenCalledWith({
        movieId,
        userId,
        ...rateMovieDto,
      });
      expect(result).toEqual(mockRating);
    });

    it("should update an existing rating", async () => {
      const existingRating = { ...mockRating };
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockMovieRatingRepository.findOne.mockResolvedValue(existingRating);
      mockMovieRatingRepository.save.mockResolvedValue({
        ...existingRating,
        ...rateMovieDto,
      });
      mockMovieRatingRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue({ avgRating: "4.0" });

      const result = await service.rateMovie(movieId, userId, rateMovieDto);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(mockMovieRatingRepository.save).toHaveBeenCalledWith({
        ...existingRating,
        ...rateMovieDto,
      });
      expect(result).toEqual({ ...existingRating, ...rateMovieDto });
    });

    it("should throw NotFoundException when movie is not found", async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(
        service.rateMovie(movieId, userId, rateMovieDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserRating", () => {
    it("should return user rating for a movie", async () => {
      const movieId = 1;
      const userId = 1;

      mockMovieRatingRepository.findOne.mockResolvedValue(mockRating);

      const result = await service.getUserRating(movieId, userId);

      expect(mockMovieRatingRepository.findOne).toHaveBeenCalledWith({
        where: { movieId, userId },
        relations: ["movie"],
      });
      expect(result).toEqual(mockRating);
    });

    it("should throw NotFoundException when rating is not found", async () => {
      const movieId = 1;
      const userId = 1;

      mockMovieRatingRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserRating(movieId, userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("deleteRating", () => {
    it("should delete a rating", async () => {
      const movieId = 1;
      const userId = 1;

      mockMovieRatingRepository.delete.mockResolvedValue({ affected: 1 });
      mockMovieRatingRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue({ avgRating: "0" });

      await service.deleteRating(movieId, userId);

      expect(mockMovieRatingRepository.delete).toHaveBeenCalledWith({
        movieId,
        userId,
      });
    });

    it("should throw NotFoundException when rating is not found", async () => {
      const movieId = 1;
      const userId = 1;

      mockMovieRatingRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteRating(movieId, userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
