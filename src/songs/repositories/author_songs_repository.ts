import { getConnection } from 'typeorm';
import { AuthorSongs } from '../entities/author_songs_entity';

export function getAuthorSongsRepository() {
  const conn = getConnection();
  return conn.getRepository(AuthorSongs);
}
