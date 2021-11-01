import { getSongsRepository } from './songs_repository';
import { getAuthorSkinRepository } from './author_skintone_repository';
import { getAuthorSongsRepository } from './author_songs_repository';
import { getGenreSongsRepository } from './genre_songs_repository';

export = {
  getSongsRepository: getSongsRepository(),
  getAuthorSkinRepository: getAuthorSkinRepository(),
  getAuthorSongsRepository: getAuthorSongsRepository(),
  getGenreSongsRepository: getGenreSongsRepository(),
};
