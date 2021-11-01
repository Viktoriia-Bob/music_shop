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
import { inject } from 'inversify';
import { Response } from 'express';

import { CartWithSongs } from '../entities/carts_with_songs_entity';
import { TYPE } from '../../constants/types';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { CartsWithSongsService } from '../services/carts_with_songs_service';

@controller('/cart-with-songs', checkJwt())
export class CartsWithSongsController {
  constructor(
    @inject(TYPE.CartsWithSongsService)
    private cartsWithSongsService: CartsWithSongsService
  ) {}

  @httpGet('/')
  public async getCarts(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.cartsWithSongsService.getCarts(skip, take);
  }

  @httpPost('/')
  public async createCart(@requestBody() newCart: CartWithSongs) {
    return this.cartsWithSongsService.createCart(newCart);
  }

  @httpPatch('/:id')
  public async updateCart(
    @requestBody() updateCart: CartWithSongs,
    @requestParam('id') id: number
  ) {
    return this.cartsWithSongsService.updateCart(updateCart, id);
  }

  @httpDelete('/:id')
  public async removeCart(@requestParam('id') id: number) {
    return this.cartsWithSongsService.removeCart(id);
  }

  @httpGet('/get-songs-from-cart')
  public async getSongsFromCart(@response() res: Response) {
    const id = await res.locals.jwtPayload.userId;
    return this.cartsWithSongsService.getSongsFromCart(id);
  }

  @httpPut('/add-song')
  public async addSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    return this.cartsWithSongsService.addSong(songId, id);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    return this.cartsWithSongsService.deleteSong(songId, id);
  }
}
