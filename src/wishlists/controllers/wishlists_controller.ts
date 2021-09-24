import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlists_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';

@controller('/wishlists')
export class WishlistsController {
  private readonly _wishlistRepository: Repository<Wishlist>;

  constructor(
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>
  ) {
    this._wishlistRepository = wishlistRepository;
  }

  @httpGet('/')
  public async getWishlists() {
    return this._wishlistRepository.find();
  }

  @httpPost('/')
  public async createWishlist(@requestBody() newWishlist: Wishlist) {
    return this._wishlistRepository.save(
      this._wishlistRepository.create(newWishlist)
    );
  }

  @httpPatch('/:id')
  public async updateWishlist(
    @requestParam('id') idParam,
    @requestBody() updateWishlist: Wishlist
  ) {
    return this._wishlistRepository.update({ id: idParam }, updateWishlist);
  }

  @httpDelete('/:id')
  public async deleteWishlist(@requestParam('id') idParam: number) {
    await this._wishlistRepository.delete({ id: idParam });
  }
}
