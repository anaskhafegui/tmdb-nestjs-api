import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Genre } from "./genre.entity";

@Entity({ name: "movies" })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: "tmdb_id", type: "int" })
  tmdbId: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  overview: string;

  @Column({ name: "poster_path", type: "varchar", length: 512, nullable: true })
  posterPath?: string;

  @Column({ name: "release_date", type: "date", nullable: true })
  releaseDate?: string;

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true })
  @JoinTable({
    name: "movie_genres",
    joinColumn: { name: "movie_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "genre_id", referencedColumnName: "id" },
  })
  genres: Genre[];

  @Column({ name: "avg_rating", type: "float", default: 0 })
  avgRating: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
