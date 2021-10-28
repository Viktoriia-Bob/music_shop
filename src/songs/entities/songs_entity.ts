import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthorSongs } from './author_songs_entity';
import { GenreSongs } from './genre_songs_entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public name!: string;

  @ManyToOne(() => GenreSongs)
  @JoinColumn()
  public genre!: GenreSongs;

  @ManyToOne(() => AuthorSongs)
  @JoinColumn()
  public author!: AuthorSongs;

  @Column({ type: 'float', default: 0.0 })
  public price!: number;

  @Column({ default: 'https://picsum.photos/200' })
  public image?: string;
}
