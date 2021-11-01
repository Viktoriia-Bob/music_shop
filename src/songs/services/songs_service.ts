import { inject, injectable } from 'inversify';
import { Between, Like, Repository } from 'typeorm';

import { Song } from '../entities/songs_entity';
import { GenreSongs } from '../entities/genre_songs_entity';
import { AuthorSongs } from '../entities/author_songs_entity';
import { AuthorSkinTone } from '../entities/author_skintone_entity';
import { TYPE } from '../../constants/types';

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

  public async get(skip, take) {
    if (take < 100) {
      return this._songRepository.find({
        skip,
        take,
        relations: ['genre', 'author'],
        order: {
          id: 'ASC',
        },
      });
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

    newSong.image = `https://${process.env.S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${newSong.image}`;

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

    if (updateSong.image) {
      updateSong.image = `https://${process.env.S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${updateSong.image}`;
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
    const songs = await this._songRepository.find({
      relations: ['genre', 'author'],
      skip: skip,
      take: take,
    });

    return songs.filter((song) => song.genre.name === genre);
  }

  public async filterByAuthor(author: string, skip, take) {
    const songs = await this._songRepository.find({
      relations: ['author', 'genre'],
      skip: skip,
      take: take,
    });

    return songs.filter((song) => song.author.name === author);
  }

  public async filterByAuthorSkinTone(skintone: string, skip, take) {
    const songs = await this._songRepository.find({
      relations: ['author', 'genre'],
    });

    const authors = await this._authorSongsRepository.find({
      relations: ['skinTone'],
    });

    const filterAuthors = authors.filter(
      (author) => author.skinTone.name === skintone
    );

    return songs.filter((song) =>
      filterAuthors.find((author) => author.id === song.author.id, {
        skip: skip,
        take: take,
      })
    );
  }

  public async filterByPrice(priceLow: number, priceHigh: number, skip, take) {
    return this._songRepository.find({
      relations: ['author', 'genre'],
      where: {
        price: Between(priceLow, priceHigh),
      },
      skip: skip,
      take: take,
    });
  }

  public async searchByName(words, skip, take) {
    return this._songRepository.find({
      relations: ['author', 'genre'],
      where: { name: Like(`%${words}%`) },
      skip: skip,
      take: take,
    });
  }

  public async getFilters() {
    const genre = await this._genreSongsRepository.find();
    const author = await this._authorSongsRepository.find();
    const authorSkin = await this._authorSkinRepository.find();
    return {
      genres: { id: 1, fullName: `Genres`, items: genre },
      authors: { id: 2, fullName: `Authors`, items: author },
      skinTones: { id: 3, fullName: `Author's skin tone`, items: authorSkin },
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
