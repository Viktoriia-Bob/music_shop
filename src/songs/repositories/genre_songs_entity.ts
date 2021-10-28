import { getConnection } from 'typeorm';
import { GenreSongs } from '../entities/genre_songs_entity';

export function getGenreSongsRepository() {
  const conn = getConnection();
  return conn.getRepository(GenreSongs);
}
