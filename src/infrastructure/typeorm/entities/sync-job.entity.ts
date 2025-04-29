// src/infra/typeorm/entities/sync-job.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum SyncStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum ErrorType {
  NETWORK = "NETWORK",
  PROVIDER = "PROVIDER",
  UNKNOWN = "UNKNOWN",
}

@Entity({ name: "sync_jobs" })
export class SyncJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: "job_name", type: "varchar", length: 100 })
  jobName: string;

  @Column({ name: "last_page_synced", type: "int", default: 0 })
  lastPageSynced: number;

  @Column({ type: "enum", enum: SyncStatus, default: SyncStatus.PENDING })
  status: SyncStatus;

  @Column({
    name: "last_error_type",
    type: "enum",
    enum: ErrorType,
    nullable: true,
  })
  lastErrorType?: ErrorType;

  @Column({ name: "last_error_message", type: "text", nullable: true })
  lastErrorMessage?: string;

  @Column({ name: "last_error_code", type: "int", nullable: true })
  lastErrorCode?: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
