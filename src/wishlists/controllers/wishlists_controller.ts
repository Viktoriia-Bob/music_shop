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
import { Wishlist } from '../entities/wishlists_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';
import { Song } from '../../songs/entities/songs_entity';

@controller('/wishlists')
export class WishlistsController {
  private readonly _wishlistRepository: Repository<Wishlist>;
  private readonly _songRepository: Repository<Song>;

  constructor(
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>,
    @inject(TYPE.SongRepository) songRepository: Repository<Song>
  ) {
    this._wishlistRepository = wishlistRepository;
    this._songRepository = songRepository;
  }

  @httpGet('/')
  public async getWishlists() {
    return this._wishlistRepository.find({ skip: 0, take: 10 });
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

  @httpPut('/add-song')
  public async addSong(
    @queryParam('wishlistId') wishlistId: number,
    @queryParam('songId') songId: number
  ) {
    const wishlist = await this._wishlistRepository.findOne(wishlistId, {
      relations: ['listOfSongs'],
    });
    const song = await this._songRepository.findOne(songId);
    wishlist.listOfSongs.push(song);
    return this._wishlistRepository.save(wishlist);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('wishlistId') wishlistId: number,
    @queryParam('songId') songId: number
  ) {
    const wishlist = await this._wishlistRepository.findOne(wishlistId, {
      relations: ['listOfSongs'],
    });
    const songToRemove = await this._songRepository.findOne(songId);
    wishlist.listOfSongs = wishlist.listOfSongs.filter((song) => {
      return song.id !== songToRemove.id;
    });
    return this._wishlistRepository.save(wishlist);
  }
}
