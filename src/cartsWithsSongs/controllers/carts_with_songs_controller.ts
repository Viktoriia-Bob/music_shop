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
import { Repository } from 'typeorm';
import { CartWithSongs } from '../entities/carts_with_songs_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';

@controller('/cart-with-songs')
export class CartsWithSongsController {
  private readonly _cartRepository: Repository<CartWithSongs>;

  constructor(
    @inject(TYPE.CartWithSongsRepository)
    cartRepository: Repository<CartWithSongs>
  ) {
    this._cartRepository = cartRepository;
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
}
