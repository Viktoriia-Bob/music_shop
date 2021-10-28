import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
  queryParam,
  requestBody,
  requestParam,
  response,
} from 'inversify-express-utils';
import { Repository } from 'typeorm';
import { CartWithSongs } from '../entities/carts_with_songs_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';
import { Song } from '../../songs/entities/songs_entity';
import { Response } from 'express';
import { checkJwt } from '../../middlewares/check_jwt_middleware';

@controller('/cart-with-songs', checkJwt())
export class CartsWithSongsController {
  private readonly _cartRepository: Repository<CartWithSongs>;
  private readonly _songRepository: Repository<Song>;

  constructor(
    @inject(TYPE.CartWithSongsRepository)
    cartRepository: Repository<CartWithSongs>,
    @inject(TYPE.SongRepository) songRepository: Repository<Song>
  ) {
    this._cartRepository = cartRepository;
    this._songRepository = songRepository;
  }

  @httpGet('/')
  public async getCarts(
    @queryParam('page') page = 1,
    @queryParam('limit') limit = 10
  ) {
    if (limit < 100) {
      return this._cartRepository.find({ skip: (page - 1) * 10, take: limit });
    } else {
      return `Limit must be less than 100`;
    }
  }

  @httpPost('/')
  public async createCart(@requestBody() newCart: CartWithSongs) {
    return this._cartRepository.save(this._cartRepository.create(newCart));
  }

  @httpPatch('/:id')
  public async updateCart(
    @requestBody() updateCart: CartWithSongs,
    @requestParam('id') id: number
  ) {
    return this._cartRepository.update({ id }, updateCart);
  }

  @httpDelete('/:id')
  public async removeCart(@requestParam('id') id: number) {
    return this._cartRepository.delete({ id });
  }

  @httpGet('/get-songs-from-cart')
  public async getSongsFromCart(@response() res: Response) {
    const id = await res.locals.jwtPayload.userId;
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });
    const cart = await carts.find((item) => item?.owner?.id === id);
    return this._songRepository.findByIds(
      [...cart.listOfSongs.map((song) => song.id)],
      { relations: ['author', 'genre'] }
    );
  }

  @httpPut('/add-song')
  public async addSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });
    const cart = await carts.find((item) => item?.owner?.id === id);
    const song = await this._songRepository.findOne(songId);
    cart.listOfSongs.push(song);
    return this._cartRepository.save(cart);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });
    const cart = await carts.find((item) => item?.owner?.id === id);
    const songToRemove = await this._songRepository.findOne(songId);
    cart.listOfSongs = cart.listOfSongs.filter(
      (song) => song.id !== songToRemove.id
    );
    return this._cartRepository.save(cart);
  }
}
