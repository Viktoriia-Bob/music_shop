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

import { Wishlist } from '../entities/wishlists_entity';
import { TYPE } from '../../constants/types';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { WishlistsService } from '../services/wishlists_service';

@controller('/wishlists', checkJwt())
export class WishlistsController {
  constructor(
    @inject(TYPE.WishlistsService) private wishlistsService: WishlistsService
  ) {}

  @httpGet('/')
  public async getWishlists(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.wishlistsService.getWishlists(skip, take);
  }

  @httpPost('/')
  public async createWishlist(@requestBody() newWishlist: Wishlist) {
    return this.wishlistsService.createWishlist(newWishlist);
  }

  @httpPatch('/:id')
  public async updateWishlist(
    @requestParam('id') idParam,
    @requestBody() updateWishlist: Wishlist
  ) {
    return this.wishlistsService.updateWishlist(idParam, updateWishlist);
  }

  @httpDelete('/:id')
  public async deleteWishlist(@requestParam('id') idParam: number) {
    return this.wishlistsService.deleteWishlist(idParam);
  }

  @httpGet('/get-songs-from-wishlist')
  public async getSongsFromWishlist(
    @response() res: Response,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99,
    @queryParam('list') list = false
  ) {
    const id = await res.locals.jwtPayload.userId;
    return this.wishlistsService.getSongsFromWishlist(id, skip, take, list);
  }

  @httpPut('/add-song')
  public async addSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    return this.wishlistsService.addSong(songId, id);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    return this.wishlistsService.deleteSong(songId, id);
  }
}
