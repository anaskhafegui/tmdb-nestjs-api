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
    this.tmdbPath = this.config.get<string>("tmdbPath");
  }

  async fetchPopular(page = 1): Promise<MovieDto[]> {
    const url = `${this.tmdbPath}/3/movie/popular`;
    const resp = await lastValueFrom(
      this.http.get(url, { params: { api_key: this.apiKey, page } })
    );
    return resp.data.results as MovieDto[];
  }

  async fetchGenres(): Promise<GenreDto[]> {
    const url = `${this.tmdbPath}/3/genre/movie/list`;
    const resp = await lastValueFrom(
      this.http.get(url, { params: { api_key: this.apiKey } })
    );
    return resp.data.genres as GenreDto[];
  }
}
