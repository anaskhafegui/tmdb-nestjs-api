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

@Entity()
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @Column()
  userId: number;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Movie, (movie) => movie.watchlistEntries)
  @JoinColumn({ name: "movieId" })
  movie: Movie;

  @ManyToOne(() => User, (user) => user.watchlist)
  @JoinColumn({ name: "userId" })
  user: User;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isFavorite = false;
  }
}
