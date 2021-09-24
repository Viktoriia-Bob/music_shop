import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/users_entity';
import { Song } from '../../songs/entities/songs_entity';

@Entity()
export class CartWithSongs {
  @PrimaryGeneratedColumn()
  public id!: number;
  @OneToOne((type) => User, (user) => user.cartWithSongs)
  public owner: User;
  @ManyToMany((type) => Song)
  @JoinTable()
  public listOfSongs: Song[];
}
