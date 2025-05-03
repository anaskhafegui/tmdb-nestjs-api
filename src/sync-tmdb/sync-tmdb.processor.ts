import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { SyncTmdbService } from "./sync-tmdb.service";

@Processor("tmdb-sync")
export class SyncTmdbProcessor {
  private readonly logger = new Logger(SyncTmdbProcessor.name);

  constructor(private readonly syncTmdbService: SyncTmdbService) {}

  @Process("process-batch")
  async handleBatch(
    job: Job<{ batchStart: number; batchEnd: number; jobId: number }>
  ) {
    this.logger.log(
      `Processing job ${job.id} for batch ${job.data.batchStart}-${job.data.batchEnd}`
    );
    try {
      await this.syncTmdbService.processBatch(job.data);
      this.logger.log(
        `Completed job ${job.id} for batch ${job.data.batchStart}-${job.data.batchEnd}`
      );
    } catch (error) {
      this.logger.error(`Failed job ${job.id}: ${error.message}`);
      throw error; // This will trigger the retry mechanism
    }
  }
}
