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
} from 'inversify-express-utils';
import { Repository } from 'typeorm';
import { CartWithSongs } from '../entities/carts_with_songs_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';
import { Song } from '../../songs/entities/songs_entity';

@controller('/cart-with-songs')
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
  public async getCarts() {
    return this._cartRepository.find({ skip: 0, take: 10 });
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

  @httpPut('/add-song')
  public async addSong(
    @queryParam('cartId') cartId: number,
    @queryParam('songId') songId: number
  ) {
    const cart = await this._cartRepository.findOne(cartId, {
      relations: ['listOfSongs'],
    });
    const song = await this._songRepository.findOne(songId);
    cart.listOfSongs.push(song);
    return this._cartRepository.save(cart);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('cartId') cartId: number,
    @queryParam('songId') songId: number
  ) {
    const cart = await this._cartRepository.findOne(cartId, {
      relations: ['listOfSongs'],
    });
    const songToRemove = await this._songRepository.findOne(songId);
    cart.listOfSongs = cart.listOfSongs.filter(
      (song) => song.id !== songToRemove.id
    );
    return this._cartRepository.save(cart);
  }
}
