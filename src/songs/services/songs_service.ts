import { inject, injectable } from 'inversify';
import { Between, Repository } from 'typeorm';

import { Song } from '../entities/songs_entity';
import { GenreSongs } from '../entities/genre_songs_entity';
import { AuthorSongs } from '../entities/author_songs_entity';
import { AuthorSkinTone } from '../entities/author_skintone_entity';
import { TYPE } from '../../constants/types';
import signedUrlMiddleware = require('../../middlewares/signed_url_middleware');

@injectable()
export class SongsService {
  private readonly _songRepository: Repository<Song>;
  private readonly _genreSongsRepository: Repository<GenreSongs>;
  private readonly _authorSongsRepository: Repository<AuthorSongs>;
  private readonly _authorSkinRepository: Repository<AuthorSkinTone>;

  constructor(
    @inject(TYPE.SongRepository) songRepository: Repository<Song>,
    @inject(TYPE.GenreSongsRepository)
    genreSongsRepository: Repository<GenreSongs>,
    @inject(TYPE.AuthorSongsRepository)
    authorSongsRepository: Repository<AuthorSongs>,
    @inject(TYPE.AuthorSkinRepository)
    authorSkinRepository: Repository<AuthorSkinTone>
  ) {
    this._songRepository = songRepository;
    this._genreSongsRepository = genreSongsRepository;
    this._authorSongsRepository = authorSongsRepository;
    this._authorSkinRepository = authorSkinRepository;
  }

  public async get(skip, take, isList) {
    if (take < 100) {
      const songs = await this._songRepository.find({
        skip,
        take,
        relations: ['genre', 'author'],
        order: {
          id: 'ASC',
        },
      });

      if (isList) {
        songs.map(
          async (song) => (song.image = await signedUrlMiddleware(song.image))
        );
      }

      return songs;
    } else {
      return `Limit must be less than 100`;
    }
  }

  public async getSongById(id) {
    return this._songRepository.findOne(id, { relations: ['genre', 'author'] });
  }

  public async post(newSong) {
    const genre = await this._genreSongsRepository.findOne(newSong.genre);
    const author = await this._authorSongsRepository.findOne(newSong.author);

    return this._songRepository.save(
      this._songRepository.create({ ...newSong, genre, author })
    );
  }

  public async update(updateSong: Song, idParam: number) {
    if (updateSong.genre) {
      updateSong.genre = await this._genreSongsRepository.findOne(
        updateSong.genre
      );
    } else {
      delete updateSong.genre;
    }

    if (updateSong.author) {
      updateSong.author = await this._authorSongsRepository.findOne(
        updateSong.author
      );
    } else {
      delete updateSong.author;
    }

    if (!updateSong.name) {
      delete updateSong.name;
    }

    if (!updateSong.price) {
      delete updateSong.price;
    }

    return this._songRepository.update({ id: idParam }, { ...updateSong });
  }

  public async remove(idParam: number) {
    return this._songRepository.delete({ id: idParam });
  }

  public async filterByGenre(genre: string, skip, take) {
    const genreObj = await this._genreSongsRepository.findOne({ name: genre });
    const songs = await this._songRepository.find({
      relations: ['genre', 'author'],
      where: { genre: genreObj },
      skip: skip,
      take: take,
    });

    songs.map(
      async (song) => (song.image = await signedUrlMiddleware(song.image))
    );

    return songs;
  }

  public async filterByAuthor(author: string, skip, take) {
    const songs = await this._songRepository
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.author', 'author_songs')
      .leftJoinAndSelect('song.genre', 'genre_songs')
      .where('LOWER(author_songs.name) LIKE LOWER(:value)', {
        value: `%${author}%`,
      })
      .skip(skip)
      .take(take)
      .getMany();

    songs.map(
      async (song) => (song.image = await signedUrlMiddleware(song.image))
    );

    return songs;
  }

  public async filterByAuthorSkinTone(skintone: string, skip, take) {
    const skinToneObj = await this._authorSkinRepository.findOne({
      name: skintone,
    });
    const songs = await this._songRepository.find({
      relations: ['author', 'genre'],
      where: { author: { skinTone: skinToneObj } },
      skip: skip,
      take: take,
    });

    songs.map(
      async (song) => (song.image = await signedUrlMiddleware(song.image))
    );

    return songs;
  }

  public async filterByPrice(priceLow: number, priceHigh: number, skip, take) {
    const songs = await this._songRepository.find({
      relations: ['author', 'genre'],
      where: {
        price: Between(priceLow, priceHigh),
      },
      skip: skip,
      take: take,
    });

    songs.map(
      async (song) => (song.image = await signedUrlMiddleware(song.image))
    );

    return songs;
  }

  public async searchByName(words, skip, take) {
    const songs = await this._songRepository
      .createQueryBuilder('song')
      .where('LOWER(song.name) LIKE LOWER(:value)', { value: `%${words}%` })
      .leftJoinAndSelect('song.author', 'author_songs')
      .leftJoinAndSelect('song.genre', 'genre_songs')
      .skip(skip)
      .take(take)
      .getMany();

    songs.map(
      async (song) => (song.image = await signedUrlMiddleware(song.image))
    );

    return songs;
  }

  public async getFilters() {
    const genre = await this._genreSongsRepository.find();
    const authorSkin = await this._authorSkinRepository.find();
    const author = await this._authorSongsRepository.find();
    return {
      genres: { id: 1, fullName: `Genres`, items: genre },
      skinTones: { id: 2, fullName: `Author's skin tone`, items: authorSkin },
      authors: { id: 3, fullName: `Authors`, items: author },
    };
  }

  public async addNewGenre(newGenre: GenreSongs) {
    return this._genreSongsRepository.save(
      this._genreSongsRepository.create(newGenre)
    );
  }

  public async addNewAuthor(newAuthor: AuthorSongs) {
    const skinTone = await this._authorSkinRepository.findOne(
      newAuthor.skinTone
    );
    return this._authorSongsRepository.save(
      this._authorSongsRepository.create({ ...newAuthor, skinTone })
    );
  }

  public async addNewAuthorsSkinTone(newSkinTone: AuthorSkinTone) {
    return this._authorSkinRepository.save(
      this._authorSkinRepository.create(newSkinTone)
    );
  }
}
