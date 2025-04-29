import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisCacheModule } from "../infrastructure/cache/cache.module";
import { Genre } from "../infrastructure/typeorm/entities/genre.entity";
import { Movie } from "../infrastructure/typeorm/entities/movie.entity";
import { MoviesController } from "./controller/movies.controller";
import { MoviesService } from "./service/movies.service";

@Module({
  imports: [
    // gives us @InjectRepository(Movie) & @InjectRepository(Genre)
    TypeOrmModule.forFeature([Movie, Genre]),
    RedisCacheModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
