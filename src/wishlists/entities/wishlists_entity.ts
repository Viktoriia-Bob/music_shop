import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/users_entity';
import { Song } from '../../songs/entities/songs_entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  public id!: number;
  @ManyToOne(() => User, (user) => user.wishlist)
  public owner: User;
  @ManyToMany(() => Song)
  @JoinTable()
  public listOfSongs: Song[];
  @Column()
  public title!: string;
}
