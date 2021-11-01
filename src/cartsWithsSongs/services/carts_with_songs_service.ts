import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';

import { CartWithSongs } from '../entities/carts_with_songs_entity';
import { Song } from '../../songs/entities/songs_entity';
import { TYPE } from '../../constants/types';

@injectable()
export class CartsWithSongsService {
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

  public async getCarts(skip, take) {
    if (take < 100) {
      return this._cartRepository.find({ skip: skip, take: take });
    } else {
      return `Limit must be less than 100`;
    }
  }

  public async createCart(newCart: CartWithSongs) {
    return this._cartRepository.save(this._cartRepository.create(newCart));
  }

  public async updateCart(updateCart: CartWithSongs, id: number) {
    return this._cartRepository.update({ id }, updateCart);
  }

  public async removeCart(id: number) {
    return this._cartRepository.delete({ id });
  }

  public async getSongsFromCart(id) {
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });

    const cart = await carts.find((item) => item?.owner?.id === id);

    return this._songRepository.findByIds(
      [...cart.listOfSongs.map((song) => song.id)],
      { relations: ['author', 'genre'] }
    );
  }

  public async addSong(songId: number, userId: number) {
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });

    const cart = await carts.find((item) => item?.owner?.id === userId);
    const song = await this._songRepository.findOne(songId);

    cart.listOfSongs.push(song);

    return this._cartRepository.save(cart);
  }

  public async deleteSong(songId: number, userId: number) {
    const carts = await this._cartRepository.find({
      relations: ['owner', 'listOfSongs'],
    });

    const cart = await carts.find((item) => item?.owner?.id === userId);
    const songToRemove = await this._songRepository.findOne(songId);

    cart.listOfSongs = cart.listOfSongs.filter(
      (song) => song.id !== songToRemove.id
    );

    return this._cartRepository.save(cart);
  }
}
