// src/tmdb/tmdb.module.ts
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TmdbController } from "./tmdb.controller";
import { TmdbService } from "./tmdb.service";

@Module({
  imports: [HttpModule],
  providers: [TmdbService],
  controllers: [TmdbController],
  exports: [TmdbService],
})
export class TmdbModule {}
