import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ErrorType, SyncJob } from "./sync-job.entity";

@Entity({ name: "sync_error_logs" })
export class SyncErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SyncJob, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sync_job_id" })
  job: SyncJob;

  @Column({ type: "int" })
  page: number;

  @Column({ type: "enum", enum: ErrorType })
  errorType: ErrorType;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "int", nullable: true })
  code?: number;

  @CreateDateColumn({ name: "occurred_at" })
  occurredAt: Date;
}
