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

@Entity("movie_ratings")
export class MovieRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "movie_id" })
  movieId: number;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.ratings)
  @JoinColumn({ name: "movie_id" })
  movie: Movie;
}
