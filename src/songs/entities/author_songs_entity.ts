import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Song } from './songs_entity';
import { AuthorSkinTone } from './author_skintone_entity';

@Entity()
export class AuthorSongs {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Song, (song) => song.author, { cascade: true })
  @JoinColumn()
  songs?: Song[];

  @Column()
  name!: string;

  @ManyToOne(() => AuthorSkinTone, (skin) => skin.name)
  @JoinColumn()
  skinTone: AuthorSkinTone;
}
