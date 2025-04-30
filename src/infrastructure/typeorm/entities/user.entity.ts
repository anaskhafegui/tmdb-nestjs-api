import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MovieRating } from "./movie-rating.entity";
import { Watchlist } from "./watchlist.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => MovieRating, (rating) => rating.user)
  ratings: MovieRating[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlist: Watchlist[];
}
