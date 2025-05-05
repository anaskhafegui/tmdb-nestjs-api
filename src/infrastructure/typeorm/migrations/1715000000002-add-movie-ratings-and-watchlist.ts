import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMovieRatingsAndWatchlist1715000000002
  implements MigrationInterface
{
  name = "AddMovieRatingsAndWatchlist1715000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create movie_ratings table
    await queryRunner.query(`
      CREATE TABLE "movie_ratings" (
        "id" SERIAL NOT NULL,
        "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" integer NOT NULL,
        "movie_id" integer NOT NULL,
        CONSTRAINT "PK_movie_ratings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_movie_rating" UNIQUE ("user_id", "movie_id")
      )
    `);

    // Create watchlist table
    await queryRunner.query(`
      CREATE TABLE "watchlist" (
        "id" SERIAL NOT NULL,
        "is_favorite" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" integer NOT NULL,
        "movie_id" integer NOT NULL,
        CONSTRAINT "PK_watchlist" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_movie_watchlist" UNIQUE ("user_id", "movie_id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "movie_ratings"
      ADD CONSTRAINT "FK_movie_ratings_user"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "movie_ratings"
      ADD CONSTRAINT "FK_movie_ratings_movie"
      FOREIGN KEY ("movie_id")
      REFERENCES "movies"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "watchlist"
      ADD CONSTRAINT "FK_watchlist_user"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "watchlist"
      ADD CONSTRAINT "FK_watchlist_movie"
      FOREIGN KEY ("movie_id")
      REFERENCES "movies"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "watchlist" DROP CONSTRAINT "FK_watchlist_movie"`
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist" DROP CONSTRAINT "FK_watchlist_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_ratings" DROP CONSTRAINT "FK_movie_ratings_movie"`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_ratings" DROP CONSTRAINT "FK_movie_ratings_user"`
    );
    await queryRunner.query(`DROP TABLE "watchlist"`);
    await queryRunner.query(`DROP TABLE "movie_ratings"`);
  }
}
