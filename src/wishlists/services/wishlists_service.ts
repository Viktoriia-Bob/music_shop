import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';

import { Wishlist } from '../entities/wishlists_entity';
import { Song } from '../../songs/entities/songs_entity';
import { TYPE } from '../../constants/types';
import signedUrlMiddleware = require('../../middlewares/signed_url_middleware');

@injectable()
export class WishlistsService {
  private readonly _wishlistRepository: Repository<Wishlist>;
  private readonly _songRepository: Repository<Song>;

  constructor(
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>,
    @inject(TYPE.SongRepository) songRepository: Repository<Song>
  ) {
    this._wishlistRepository = wishlistRepository;
    this._songRepository = songRepository;
  }

  public async getWishlists(skip, take) {
    if (take < 100) {
      return this._wishlistRepository.find({
        skip: skip,
        take: take,
      });
    } else {
      return `Limit must be less than 100`;
    }
  }

  public async createWishlist(newWishlist: Wishlist) {
    return this._wishlistRepository.save(
      this._wishlistRepository.create(newWishlist)
    );
  }

  public async updateWishlist(idParam, updateWishlist: Wishlist) {
    return this._wishlistRepository.update({ id: idParam }, updateWishlist);
  }

  public async deleteWishlist(idParam: number) {
    await this._wishlistRepository.delete({ id: idParam });
  }

  public async getSongsFromWishlist(userId, skip, take, isList) {
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
      take: take,
      skip: skip,
    });

    const wishlist = await wishlists.find((item) => item?.owner?.id === userId);

    const songs = await this._songRepository.findByIds(
      [...wishlist.listOfSongs.map((song) => song.id)],
      { relations: ['author', 'genre'] }
    );

    if (isList) {
      songs.map(
        async (song) => (song.image = await signedUrlMiddleware(song.image))
      );
    }

    return songs;
  }

  public async addSong(songId: number, userId) {
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
    });

    const wishlist = await wishlists.find((item) => item?.owner?.id === userId);

    const song = await this._songRepository.findOne(songId);
    wishlist.listOfSongs.push(song);

    return this._wishlistRepository.save(wishlist);
  }

  public async deleteSong(songId: number, userId: number) {
    const wishlists = await this._wishlistRepository.find({
      relations: ['owner', 'listOfSongs'],
    });

    const songToRemove = await this._songRepository.findOne(songId);

    const wishlist = await wishlists.find((item) => item?.owner?.id === userId);
    wishlist.listOfSongs = wishlist.listOfSongs.filter((song) => {
      return song.id !== songToRemove.id;
    });

    return this._wishlistRepository.save(wishlist);
  }
}
