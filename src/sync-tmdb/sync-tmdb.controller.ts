import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SyncTmdbService } from "./sync-tmdb.service";

@ApiTags("Sync")
@Controller("sync")
export class SyncTmdbController {
  constructor(private readonly syncService: SyncTmdbService) {}

  @Post("tmdb")
  @ApiOperation({ summary: "Manually trigger TMDB sync" })
  async triggerSync() {
    await this.syncService.handleCron();
    return { message: "Sync started" };
  }
}
