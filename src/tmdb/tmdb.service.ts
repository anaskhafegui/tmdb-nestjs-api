import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { GenreDto } from "./dto/genre.dto";
import { MovieDto } from "./dto/movie.dto";
import { ITmdbClient } from "./interfaces/itmdb-client.interface";

@Injectable()
export class TmdbService implements ITmdbClient {
  private readonly logger = new Logger(TmdbService.name);
  private readonly apiKey: string;
  private readonly tmdbPath: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {
    this.apiKey = this.config.get<string>("tmdbApiKey");
    this.tmdbPath = "https://api.themoviedb.org";
  }

  async fetchPopular(page = 1): Promise<MovieDto[]> {
    if (page < 1) {
      throw new Error("Page number must be positive");
    }

    if (!this.apiKey) {
      throw new Error("TMDB API key is not configured");
    }

    const url = `${this.tmdbPath}/3/movie/popular`;
    try {
      const resp = await lastValueFrom(
        this.http.get(url, { params: { api_key: this.apiKey, page } })
      );

      if (!resp.data || !resp.data.results) {
        throw new Error("Invalid response format from TMDB API");
      }

      return resp.data.results as MovieDto[];
    } catch (error) {
      if (error.response?.data?.status_message) {
        throw new Error(error.response.data.status_message);
      }
      throw error;
    }
  }

  async fetchGenres(): Promise<GenreDto[]> {
    if (!this.apiKey) {
      throw new Error("TMDB API key is not configured");
    }

    const url = `${this.tmdbPath}/3/genre/movie/list`;
    try {
      const resp = await lastValueFrom(
        this.http.get(url, { params: { api_key: this.apiKey } })
      );

      if (!resp.data || !resp.data.genres) {
        throw new Error("Invalid response format from TMDB API");
      }

      return resp.data.genres as GenreDto[];
    } catch (error) {
      if (error.response?.data?.status_message) {
        throw new Error(error.response.data.status_message);
      }
      throw error;
    }
  }
}
