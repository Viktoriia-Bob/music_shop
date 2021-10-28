import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  queryParam,
  request,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import { Song } from '../entities/songs_entity';
import { Between, Like, Repository } from 'typeorm';
import { Request } from 'express';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { SongValidator } from '../validation/songs_validation';
import { GenreSongs } from '../entities/genre_songs_entity';
import { AuthorSongs } from '../entities/author_songs_entity';
import { AuthorSkinTone } from '../entities/author_skintone_entity';
import * as UploadMiddleware from '../../middlewares/upload_middleware';
import { UpdateSongsValidation } from '../validation/update_songs_validation';

@controller('/songs')
export class SongsController {
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

  @httpGet('/')
  public async get(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99,
    @request() req
  ) {
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

  @httpGet('/get-by-id/:id')
  public async getSongById(@requestParam('id') id) {
    return this._songRepository.findOne(id, { relations: ['genre', 'author'] });
  }

  @httpPost('/image-upload/', UploadMiddleware.single('image'))
  public async uploadImage(req: Request) {
    // @ts-ignore
    return req.file.key;
  }

  @httpPost('/', ValidationMiddleware(SongValidator))
  public async post(@requestBody() newSong) {
    const genre = await this._genreSongsRepository.findOne(newSong.genre);
    const author = await this._authorSongsRepository.findOne(newSong.author);
    newSong.image = `https://${process.env.S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${newSong.image}`;
    return this._songRepository.save(
      this._songRepository.create({ ...newSong, genre, author })
    );
  }

  @httpPatch('/:id', ValidationMiddleware(UpdateSongsValidation))
  public async update(
    @requestBody() updateSong: Song,
    @requestParam('id') idParam: number
  ) {
    if (updateSong.genre)
      updateSong.genre = await this._genreSongsRepository.findOne(
        updateSong.genre
      );
    else delete updateSong.genre;
    if (updateSong.author)
      updateSong.author = await this._authorSongsRepository.findOne(
        updateSong.author
      );
    else delete updateSong.author;
    if (updateSong.image)
      updateSong.image = `https://${process.env.S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${updateSong.image}`;
    if (!updateSong.name) delete updateSong.name;
    if (!updateSong.price) delete updateSong.price;
    return this._songRepository.update({ id: idParam }, { ...updateSong });
  }

  @httpDelete('/:id')
  public async remove(@requestParam('id') idParam: number) {
    return this._songRepository.delete({ id: idParam });
  }

  @httpGet('/filter-by-genre/:genre')
  public async filterByGenre(
    @requestParam('genre') genre: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    const songs = await this._songRepository.find({
      relations: ['genre', 'author'],
      skip: skip,
      take: take,
    });
    return songs.filter((song) => song.genre.name === genre);
  }

  @httpGet('/filter-by-author/:author')
  public async filterByAuthor(
    @requestParam('author') author: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    const songs = await this._songRepository.find({
      relations: ['author', 'genre'],
      skip: skip,
      take: take,
    });
    return songs.filter((song) => song.author.name === author);
  }

  @httpGet('/filter-by-author-skin-tone/:skintone')
  public async filterByAuthorSkinTone(
    @requestParam('skintone') skintone: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
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

  @httpGet('/filter-by-price/:priceLow/to/:priceHigh')
  public async filterByPrice(
    @requestParam('priceLow') priceLow: number = 0,
    @requestParam('priceHigh') priceHigh: number = 1000000,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this._songRepository.find({
      relations: ['author', 'genre'],
      where: {
        price: Between(priceLow, priceHigh),
      },
      skip: skip,
      take: take,
    });
  }

  @httpGet('/search-by-name/:words')
  public async searchByName(
    @requestParam('words') words,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this._songRepository.find({
      relations: ['author', 'genre'],
      where: { name: Like(`%${words}%`) },
      skip: skip,
      take: take,
    });
  }

  @httpGet('/filters')
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

  @httpPost('/genre/add-new')
  public async addNewGenre(@requestBody() newGenre: GenreSongs) {
    return this._genreSongsRepository.save(
      this._genreSongsRepository.create(newGenre)
    );
  }

  @httpPost('/author/add-new')
  public async addNewAuthor(@requestBody() newAuthor: AuthorSongs) {
    const skinTone = await this._authorSkinRepository.findOne(
      newAuthor.skinTone
    );
    return this._authorSongsRepository.save(
      this._authorSongsRepository.create({ ...newAuthor, skinTone })
    );
  }

  @httpPost('/authors-skin-tone/add-new')
  public async addNewAuthorsSkinTone(
    @requestBody() newSkinTone: AuthorSkinTone
  ) {
    return this._authorSkinRepository.save(
      this._authorSkinRepository.create(newSkinTone)
    );
  }
}
