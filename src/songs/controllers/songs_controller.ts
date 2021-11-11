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
import { Request } from 'express';
import { inject } from 'inversify';

import { Song } from '../entities/songs_entity';
import { TYPE } from '../../constants/types';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { SongValidator } from '../validation/songs_validation';
import { GenreSongs } from '../entities/genre_songs_entity';
import { AuthorSongs } from '../entities/author_songs_entity';
import { AuthorSkinTone } from '../entities/author_skintone_entity';
import * as UploadMiddleware from '../../middlewares/upload_middleware';
import { UpdateSongsValidation } from '../validation/update_songs_validation';
import { SongsService } from '../services/songs_service';

@controller('/songs')
export class SongsController {
  constructor(@inject(TYPE.SongsService) private songsService: SongsService) {}

  @httpGet('/')
  public async get(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99,
    @queryParam('list') list = false
  ) {
    return this.songsService.get(skip, take, list);
  }

  @httpGet('/get-by-id/:id')
  public async getSongById(@requestParam('id') id) {
    return this.songsService.getSongById(id);
  }

  @httpPost('/image-upload/', UploadMiddleware.single('image'))
  public async uploadImage(req: Request) {
    // @ts-ignore
    return req.file.key;
  }

  @httpPost('/', ValidationMiddleware(SongValidator))
  public async post(@requestBody() newSong) {
    return this.songsService.post(newSong);
  }

  @httpPatch('/:id', ValidationMiddleware(UpdateSongsValidation))
  public async update(
    @requestBody() updateSong: Song,
    @requestParam('id') idParam: number
  ) {
    return this.songsService.update(updateSong, idParam);
  }

  @httpDelete('/:id')
  public async remove(@requestParam('id') idParam: number) {
    return this.songsService.remove(idParam);
  }

  @httpGet('/filter-by-genre/:genre')
  public async filterByGenre(
    @requestParam('genre') genre: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.songsService.filterByGenre(genre, skip, take);
  }

  @httpGet('/search-author/:author')
  public async filterByAuthor(
    @requestParam('author') author: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.songsService.filterByAuthor(author, skip, take);
  }

  @httpGet('/filter-by-author-skin-tone/:skintone')
  public async filterByAuthorSkinTone(
    @requestParam('skintone') skintone: string,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.songsService.filterByAuthorSkinTone(skintone, skip, take);
  }

  @httpPost('/filter-by-price')
  public async filterByPrice(
    @requestBody() { priceLow, priceHigh },
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.songsService.filterByPrice(priceLow, priceHigh, skip, take);
  }

  @httpGet('/search-by-name/:words')
  public async searchByName(
    @requestParam('words') words,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.songsService.searchByName(words, skip, take);
  }

  @httpGet('/filters')
  public async getFilters() {
    return this.songsService.getFilters();
  }

  @httpPost('/genre/add-new')
  public async addNewGenre(@requestBody() newGenre: GenreSongs) {
    return this.songsService.addNewGenre(newGenre);
  }

  @httpPost('/author/add-new')
  public async addNewAuthor(@requestBody() newAuthor: AuthorSongs) {
    return this.songsService.addNewAuthor(newAuthor);
  }

  @httpPost('/authors-skin-tone/add-new')
  public async addNewAuthorsSkinTone(
    @requestBody() newSkinTone: AuthorSkinTone
  ) {
    return this.songsService.addNewAuthorsSkinTone(newSkinTone);
  }
}
