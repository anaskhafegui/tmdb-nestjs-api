import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisCacheModule } from "../infrastructure/cache/cache.module";
import { Genre } from "../infrastructure/typeorm/entities/genre.entity";
import { MovieRating } from "../infrastructure/typeorm/entities/movie-rating.entity";
import { Movie } from "../infrastructure/typeorm/entities/movie.entity";
import { Watchlist } from "../infrastructure/typeorm/entities/watchlist.entity";
import { MovieRatingsController } from "./controller/movie-ratings.controller";
import { MoviesController } from "./controller/movies.controller";
import { WatchlistController } from "./controller/watchlist.controller";
import { MovieRatingsService } from "./service/movie-ratings.service";
import { MoviesService } from "./service/movies.service";
import { WatchlistService } from "./service/watchlist.service";

@Module({
  imports: [
    // gives us @InjectRepository(Movie) & @InjectRepository(Genre)
    TypeOrmModule.forFeature([Movie, Genre, MovieRating, Watchlist]),
    RedisCacheModule,
  ],
  controllers: [MoviesController, MovieRatingsController, WatchlistController],
  providers: [MoviesService, MovieRatingsService, WatchlistService],
  exports: [MoviesService],
})
export class MoviesModule {}
