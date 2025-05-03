import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTables1715000000000 implements MigrationInterface {
  name = "InitTables1715000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" SERIAL NOT NULL, "tmdb_id" integer NOT NULL, "title" character varying(255) NOT NULL, "overview" text NOT NULL, "poster_path" character varying(512), "release_date" date, "avg_rating" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a30f596bb8c7b8213cec64c512" ON "movies" ("tmdb_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "genres" ("id" SERIAL NOT NULL, "tmdb_id" integer NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a58e7d9b64423a6fa270d8af16" ON "genres" ("tmdb_id") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_jobs_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'FAILED', 'COMPLETED')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_jobs_last_error_type_enum" AS ENUM('NETWORK', 'PROVIDER', 'UNKNOWN')`
    );
    await queryRunner.query(
      `CREATE TABLE "sync_jobs" ("id" SERIAL NOT NULL, "job_name" character varying(100) NOT NULL, "last_page_synced" integer NOT NULL DEFAULT '0', "status" "public"."sync_jobs_status_enum" NOT NULL DEFAULT 'PENDING', "last_error_type" "public"."sync_jobs_last_error_type_enum", "last_error_message" text, "last_error_code" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8586b15058c8811de6286052139" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b8aee7d2527e20fe93f6531766" ON "sync_jobs" ("job_name") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_error_logs_errortype_enum" AS ENUM('NETWORK', 'PROVIDER', 'UNKNOWN')`
    );
    await queryRunner.query(
      `CREATE TABLE "sync_error_logs" ("id" SERIAL NOT NULL, "page" integer NOT NULL, "errorType" "public"."sync_error_logs_errortype_enum" NOT NULL, "message" text NOT NULL, "code" integer, "occurred_at" TIMESTAMP NOT NULL DEFAULT now(), "sync_job_id" integer, CONSTRAINT "PK_bd8e18b822951f137de41b877b3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "movie_genres" ("movie_id" integer NOT NULL, "genre_id" integer NOT NULL, CONSTRAINT "PK_ec45eae1bc95d1461ad55713ffc" PRIMARY KEY ("movie_id", "genre_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae967ce58ef99e9ff3933ccea4" ON "movie_genres" ("movie_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbbc12542564f7ff56e36f5bbf" ON "movie_genres" ("genre_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "sync_error_logs" ADD CONSTRAINT "FK_9cbb1bb872a9b5b0f25eef3a9f1" FOREIGN KEY ("sync_job_id") REFERENCES "sync_jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_bbbc12542564f7ff56e36f5bbf6"`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_ae967ce58ef99e9ff3933ccea48"`
    );
    await queryRunner.query(
      `ALTER TABLE "sync_error_logs" DROP CONSTRAINT "FK_9cbb1bb872a9b5b0f25eef3a9f1"`
    );
    await queryRunner.query(`DROP INDEX "IDX_bbbc12542564f7ff56e36f5bbf"`);
    await queryRunner.query(`DROP INDEX "IDX_ae967ce58ef99e9ff3933ccea4"`);
    await queryRunner.query(`DROP TABLE "movie_genres"`);
    await queryRunner.query(`DROP TABLE "sync_error_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."sync_error_logs_errortype_enum"`
    );
    await queryRunner.query(`DROP INDEX "IDX_b8aee7d2527e20fe93f6531766"`);
    await queryRunner.query(`DROP TABLE "sync_jobs"`);
    await queryRunner.query(
      `DROP TYPE "public"."sync_jobs_last_error_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."sync_jobs_status_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_a58e7d9b64423a6fa270d8af16"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP INDEX "IDX_a30f596bb8c7b8213cec64c512"`);
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
