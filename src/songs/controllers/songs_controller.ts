import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import { Song } from '../entities/songs_entity';
import { Between, Equal, Like, Repository } from 'typeorm';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { SongValidator } from '../validation/songs_validation';

@controller('/songs')
export class SongsController {
  private readonly _songRepository: Repository<Song>;

  constructor(@inject(TYPE.SongRepository) songRepository: Repository<Song>) {
    this._songRepository = songRepository;
  }

  @httpGet('/')
  public async get(
    @queryParam('page') page = 1,
    @queryParam('limit') limit = 10
  ) {
    if (limit < 100) {
      return this._songRepository.find({ skip: (page - 1) * 10, take: limit });
    } else {
      return `Limit must be less than 100`;
    }
  }

  @httpPost('/', ValidationMiddleware(SongValidator))
  public async post(@requestBody() newSong: Song) {
    return this._songRepository.save(this._songRepository.create(newSong));
  }

  @httpPatch('/:id', ValidationMiddleware(SongValidator))
  public async update(
    @requestBody() updateSong: Song,
    @requestParam('id') idParam: number
  ) {
    return this._songRepository.update({ id: idParam }, updateSong);
  }

  @httpDelete('/:id')
  public async remove(@requestParam('id') idParam: number) {
    return this._songRepository.delete({ id: idParam });
  }

  @httpGet('/filter-by-genre/:genre')
  public async filterByGenre(@requestParam('genre') genre: string) {
    return this._songRepository.find({ genre: Equal(genre) });
  }

  @httpGet('/filter-by-author/:author')
  public async filterByAuthor(@requestParam('author') author: string) {
    return this._songRepository.find({ author: Equal(author) });
  }

  @httpGet('/filter-by-price/:priceLow/to/:priceHigh')
  public async filterByPrice(
    @requestParam('priceLow') priceLow: number,
    @requestParam('priceHigh') priceHigh: number
  ) {
    return this._songRepository.find({ price: Between(priceLow, priceHigh) });
  }

  @httpGet('/search-by-name/:words')
  public async searchByName(@requestParam('words') words) {
    return this._songRepository.find({ name: Like(`%${words}%`) });
  }
}
