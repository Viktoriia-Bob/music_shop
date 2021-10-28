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
import { Wishlist } from '../entities/wishlists_entity';
import { TYPE } from '../../constants/types';
import { inject } from 'inversify';
import { Song } from '../../songs/entities/songs_entity';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { Response } from 'express';

@controller('/wishlists', checkJwt())
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
  public async getWishlists(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    if (take < 100) {
      return this._wishlistRepository.find({
        skip: skip,
        take: take,
      });
    } else {
      return `Limit must be less than 100`;
    }
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

  @httpGet('/get-songs-from-wishlist')
  public async getSongsFromWishlist(
    @response() res: Response,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    const id = await res.locals.jwtPayload.userId;
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
      take: take,
      skip: skip,
    });
    const wishlist = await wishlists.find((item) => item?.owner?.id === id);
    return this._songRepository.findByIds(
      [...wishlist.listOfSongs.map((song) => song.id)],
      { relations: ['author', 'genre'] }
    );
  }

  @httpPut('/add-song')
  public async addSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
    });
    const wishlist = await wishlists.find((item) => item?.owner?.id === id);
    const song = await this._songRepository.findOne(songId);
    wishlist.listOfSongs.push(song);
    return this._wishlistRepository.save(wishlist);
  }

  @httpPut('/delete-song')
  public async deleteSong(
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const id = await res.locals.jwtPayload.userId;
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
    });
    const wishlist = await wishlists.find((item) => item.owner.id === id);
    const songToRemove = await this._songRepository.findOne(songId);
    wishlist.listOfSongs = wishlist.listOfSongs.filter((song) => {
      return song.id !== songToRemove.id;
    });
    return this._wishlistRepository.save(wishlist);
  }
}
