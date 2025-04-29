// src/tmdb/interfaces/itmdb-client.interface.ts
import { GenreDto } from "../dto/genre.dto";
import { MovieDto } from "../dto/movie.dto";

export interface ITmdbClient {
  /**
   * Fetches a page of popular movies from TMDB.
   * @param page 1-based page index
   */
  fetchPopular(page: number): Promise<MovieDto[]>;

  /**
   * Fetches the list of all movie genres from TMDB.
   */
  fetchGenres(): Promise<GenreDto[]>;
}
