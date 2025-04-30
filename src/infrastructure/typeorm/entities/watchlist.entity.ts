import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Movie } from "./movie.entity";
import { User } from "./user.entity";

@Entity("watchlist")
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "is_favorite", default: false })
  isFavorite: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "movie_id" })
  movieId: number;

  @ManyToOne(() => User, (user) => user.watchlist)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.watchlistEntries)
  @JoinColumn({ name: "movie_id" })
  movie: Movie;
}
