import { getConnection } from 'typeorm';
import { AuthorSkinTone } from '../entities/author_skintone_entity';

export function getAuthorSkinRepository() {
  const conn = getConnection();
  return conn.getRepository(AuthorSkinTone);
}
