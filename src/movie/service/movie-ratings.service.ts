import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { MovieRating } from "../../infrastructure/typeorm/entities/movie-rating.entity";
import { Movie } from "../../infrastructure/typeorm/entities/movie.entity";
import { RateMovieDto } from "../dto/rate-movie.dto";

@Injectable()
export class MovieRatingsService {
  constructor(
    @InjectRepository(MovieRating)
    private readonly movieRatingRepo: Repository<MovieRating>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>
  ) {}

  async rateMovie(
    movieId: number,
    userId: number,
    rateMovieDto: RateMovieDto
  ): Promise<MovieRating> {
    const movie = await this.movieRepo.findOne({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    let rating = await this.movieRatingRepo.findOne({
      where: { movieId, userId },
    });

    if (rating) {
      // Update existing rating
      rating.rating = rateMovieDto.rating;
      rating.comment = rateMovieDto.comment;
    } else {
      // Create new rating
      rating = this.movieRatingRepo.create({
        movieId,
        userId,
        ...rateMovieDto,
      });
    }

    await this.movieRatingRepo.save(rating);
    await this.updateMovieAverageRating(movieId);

    return rating;
  }

  async getUserRating(movieId: number, userId: number): Promise<MovieRating> {
    const rating = await this.movieRatingRepo.findOne({
      where: { movieId, userId },
      relations: ["movie"],
    });

    if (!rating) {
      throw new NotFoundException(
        `Rating not found for movie ${movieId} and user ${userId}`
      );
    }

    return rating;
  }

  async deleteRating(movieId: number, userId: number): Promise<void> {
    const result = await this.movieRatingRepo.delete({ movieId, userId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Rating not found for movie ${movieId} and user ${userId}`
      );
    }

    await this.updateMovieAverageRating(movieId);
  }

  private async updateMovieAverageRating(movieId: number): Promise<void> {
    const result = await this.movieRatingRepo
      .createQueryBuilder("rating")
      .select("AVG(rating.rating)", "avgRating")
      .where("rating.movieId = :movieId", { movieId })
      .getRawOne();

    const avgRating = result?.avgRating ? parseFloat(result.avgRating) : 0;
    await this.movieRepo.update({ id: movieId }, { avgRating });
  }
}
