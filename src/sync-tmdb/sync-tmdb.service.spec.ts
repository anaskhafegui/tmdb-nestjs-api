import { getQueueToken } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Queue } from "bull";
import { Cache } from "cache-manager";
import { DataSource, Repository } from "typeorm";
import { Genre } from "../infrastructure/typeorm/entities/genre.entity";
import { Movie } from "../infrastructure/typeorm/entities/movie.entity";
import { SyncErrorLog } from "../infrastructure/typeorm/entities/sync-error-log.entity";
import {
  ErrorType,
  SyncJob,
  SyncStatus,
} from "../infrastructure/typeorm/entities/sync-job.entity";
import { ITmdbClient } from "../tmdb/interfaces/itmdb-client.interface";
import { SyncTmdbService } from "./sync-tmdb.service";

describe("SyncTmdbService", () => {
  let service: SyncTmdbService;
  let mockTmdbClient: jest.Mocked<ITmdbClient>;
  let mockMovieRepo: jest.Mocked<Repository<Movie>>;
  let mockGenreRepo: jest.Mocked<Repository<Genre>>;
  let mockSyncJobRepo: jest.Mocked<Repository<SyncJob>>;
  let mockQueue: jest.Mocked<Queue>;
  let cacheManager: Cache;
  let dataSource: DataSource;

  beforeEach(async () => {
    mockTmdbClient = {
      fetchPopular: jest.fn(),
      fetchGenres: jest.fn(),
    } as jest.Mocked<ITmdbClient>;

    mockMovieRepo = {
      find: jest.fn(),
      save: jest.fn(),
      upsert: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockGenreRepo = {
      find: jest.fn(),
      save: jest.fn(),
      upsert: jest.fn(),
    } as any;

    mockSyncJobRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn().mockReturnValue({ jobName: "tmdb-popular" }),
    } as any;

    const mockErrorRepo = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn(),
    } as any;

    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncTmdbService,
        {
          provide: "ITmdbClient",
          useValue: mockTmdbClient,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepo,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepo,
        },
        {
          provide: getRepositoryToken(SyncJob),
          useValue: mockSyncJobRepo,
        },
        {
          provide: getQueueToken("tmdb-sync"),
          useValue: mockQueue,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn().mockImplementation((entity) => {
              if (entity === Movie) return mockMovieRepo;
              if (entity === Genre) return mockGenreRepo;
              if (entity === SyncJob) return mockSyncJobRepo;
              if (entity === SyncErrorLog) return mockErrorRepo;
              return null;
            }),
            transaction: jest.fn().mockImplementation((cb) =>
              cb({
                getRepository: jest.fn().mockImplementation((entity) => {
                  if (entity === Movie) return mockMovieRepo;
                  if (entity === Genre) return mockGenreRepo;
                  if (entity === SyncJob) return mockSyncJobRepo;
                  if (entity === SyncErrorLog) return mockErrorRepo;
                  return null;
                }),
              })
            ),
          },
        },
      ],
    }).compile();

    service = module.get<SyncTmdbService>(SyncTmdbService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleCron", () => {
    it("should start sync process and add jobs to queue", async () => {
      const mockGenres = [
        { id: 1, name: "Action" },
        { id: 2, name: "Comedy" },
      ];

      const mockJob = {
        id: 1,
        jobName: "tmdb-popular",
        lastPageSynced: 0,
        status: SyncStatus.PENDING,
        lastErrorType: null,
        lastErrorMessage: null,
        lastErrorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncJob;

      mockSyncJobRepo.findOne.mockResolvedValue(mockJob);
      mockSyncJobRepo.save.mockResolvedValue({
        ...mockJob,
        status: SyncStatus.IN_PROGRESS,
      });
      mockTmdbClient.fetchGenres.mockResolvedValue(mockGenres);
      mockGenreRepo.upsert.mockResolvedValue(undefined);
      mockQueue.add.mockResolvedValue({ id: 1 } as any);

      await service.handleCron();

      expect(mockSyncJobRepo.findOne).toHaveBeenCalledWith({
        where: { jobName: "tmdb-popular" },
      });
      expect(mockTmdbClient.fetchGenres).toHaveBeenCalled();
      expect(mockGenreRepo.upsert).toHaveBeenCalledWith(
        mockGenres.map((g) => ({ tmdbId: g.id, name: g.name })),
        ["tmdbId"]
      );
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it("should handle genre sync errors gracefully", async () => {
      const error = new Error("Failed to fetch genres");
      const mockJob = {
        id: 1,
        jobName: "tmdb-popular",
        lastPageSynced: 0,
        status: SyncStatus.PENDING,
        lastErrorType: null,
        lastErrorMessage: null,
        lastErrorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncJob;

      mockSyncJobRepo.findOne.mockResolvedValue(mockJob);
      mockSyncJobRepo.save.mockResolvedValue({
        ...mockJob,
        status: SyncStatus.IN_PROGRESS,
      });
      mockTmdbClient.fetchGenres.mockRejectedValue(error);

      await service.handleCron();

      expect(mockSyncJobRepo.findOne).toHaveBeenCalled();
      expect(mockTmdbClient.fetchGenres).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it("should handle empty genre list", async () => {
      const mockJob = {
        id: 1,
        jobName: "tmdb-popular",
        lastPageSynced: 0,
        status: SyncStatus.PENDING,
        lastErrorType: null,
        lastErrorMessage: null,
        lastErrorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncJob;

      mockSyncJobRepo.findOne.mockResolvedValue(mockJob);
      mockSyncJobRepo.save.mockResolvedValue({
        ...mockJob,
        status: SyncStatus.IN_PROGRESS,
      });
      mockTmdbClient.fetchGenres.mockResolvedValue([]);
      mockGenreRepo.upsert.mockResolvedValue(undefined);
      mockQueue.add.mockResolvedValue({ id: 1 } as any);

      await service.handleCron();

      expect(mockSyncJobRepo.findOne).toHaveBeenCalled();
      expect(mockTmdbClient.fetchGenres).toHaveBeenCalled();
      expect(mockGenreRepo.upsert).toHaveBeenCalledWith([], ["tmdbId"]);
      expect(mockQueue.add).toHaveBeenCalled();
    });
  });

  describe("processBatch", () => {
    it("should process batch successfully", async () => {
      const batchData = {
        batchStart: 1,
        batchEnd: 2,
        jobId: 1,
      };

      const mockMovies = [
        {
          id: 1,
          title: "Test Movie",
          overview: "Test Overview",
          poster_path: "/test.jpg",
          release_date: "2024-01-01",
          vote_average: 8.5,
          genre_ids: [1, 2],
        },
      ];

      const mockJob = {
        id: 1,
        jobName: "tmdb-popular",
        lastPageSynced: 0,
        status: SyncStatus.IN_PROGRESS,
        lastErrorType: null,
        lastErrorMessage: null,
        lastErrorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncJob;

      mockSyncJobRepo.findOne.mockResolvedValue(mockJob);
      mockTmdbClient.fetchPopular.mockResolvedValue(mockMovies);
      mockMovieRepo.upsert.mockResolvedValue(undefined);
      mockSyncJobRepo.save.mockResolvedValue({
        ...mockJob,
        lastPageSynced: batchData.batchEnd,
        status: SyncStatus.IN_PROGRESS,
      });
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(dataSource)
      );

      await service.processBatch(batchData);

      expect(mockTmdbClient.fetchPopular).toHaveBeenCalledWith(1);
      expect(mockMovieRepo.upsert).toHaveBeenCalled();
      expect(mockSyncJobRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          lastPageSynced: batchData.batchEnd,
          status: SyncStatus.IN_PROGRESS,
        })
      );
    });

    it("should handle database transaction errors", async () => {
      const batchData = {
        batchStart: 1,
        batchEnd: 2,
        jobId: 1,
      };

      const error = new Error("Database error");
      const mockJob = {
        id: 1,
        jobName: "tmdb-popular",
        lastPageSynced: 0,
        status: SyncStatus.IN_PROGRESS,
        lastErrorType: null,
        lastErrorMessage: null,
        lastErrorCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SyncJob;

      mockSyncJobRepo.findOne.mockResolvedValue(mockJob);
      mockTmdbClient.fetchPopular.mockRejectedValue(error);
      mockSyncJobRepo.save.mockResolvedValue({
        ...mockJob,
        status: SyncStatus.FAILED,
        lastErrorType: ErrorType.NETWORK,
        lastErrorMessage: "Database error",
      });

      await expect(service.processBatch(batchData)).rejects.toThrow(error);

      expect(mockSyncJobRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SyncStatus.FAILED,
          lastErrorType: ErrorType.NETWORK,
          lastErrorMessage: "Database error",
        })
      );
    });
  });
});
