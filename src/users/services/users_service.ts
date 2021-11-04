import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';
import Stripe from 'stripe';

import { User } from '../entities/users_entity';
import { Song } from '../../songs/entities/songs_entity';
import { TYPE } from '../../constants/types';
import { roleEnums } from '../enums/role_enums';

@injectable()
export class UsersService {
  private readonly _userRepository: Repository<User>;
  private readonly _songRepository: Repository<Song>;
  private stripe: Stripe;

  constructor(
    @inject(TYPE.UserRepository) userRepository: Repository<User>,
    @inject(TYPE.SongRepository) songRepository: Repository<Song>
  ) {
    this._userRepository = userRepository;
    this._songRepository = songRepository;
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
  }

  public async getUsers(skip, take) {
    if (take < 100) {
      return this._userRepository.find({
        skip: skip,
        take: take,
        order: { id: 'ASC' },
      });
    } else {
      return `Limit must be less than 100`;
    }
  }

  public async getUserById(idParam: number) {
    return this._userRepository.findOne(idParam);
  }

  public async createUser(newUser: User) {
    if (!newUser.role) {
      newUser.role = roleEnums.user;
    }
    const user = this._userRepository.create(newUser);
    user.hashPassword();
    return this._userRepository.save(user);
  }

  public async updateUser(updateUser: User, idParam: number) {
    return this._userRepository.update({ id: idParam }, updateUser);
  }

  public async removeUser(idParam: number) {
    await this._userRepository.delete({ id: idParam });
  }

  public async listOfBoughtSongs(userId, skip, take) {
    const list = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs'],
    });

    return this._songRepository.findByIds(
      [...list.boughtSongs.map((song) => song.id)],
      { relations: ['author', 'genre'], take: take, skip: skip }
    );
  }

  public async blockUser(id: number) {
    const user = await this._userRepository.findOne({ id });

    user.isBlocked = user.isBlocked === false;

    return this._userRepository.save(user);
  }

  public async buySong(userId, body) {
    const user = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs'],
    });

    const songs = await this._songRepository.findByIds(
      body.map((song) => song.id)
    );

    const price = songs
      .map((song) => song.price)
      .reduce((prev, cur) => prev + cur);

    const name = songs
      .map((song) => song.name)
      .reduce((prev, cur) => prev.concat('_' + cur));

    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: price,
            currency: 'usd',
            product_data: {
              name: name,
            },
          },
          quantity: 1,
        },
      ],
      customer: user.customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    return { url: session.url };
  }

  public async updateUserRole(id: number, role) {
    const user = await this._userRepository.findOne(id);

    user.role = role === 'admin' ? roleEnums.user : roleEnums.admin;

    return this._userRepository.save(user);
  }

  public async addSongToBought(userId) {
    const user = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs', 'cartWithSongs', 'cartWithSongs.listOfSongs'],
    });

    const songs = user.cartWithSongs.listOfSongs;

    user.boughtSongs.push(...songs);
    user.cartWithSongs.listOfSongs = [];

    return this._userRepository.save(user);
  }

  public async payments(id) {
    const user = await this._userRepository.findOne(id);
    return this.stripe.charges.list({
      customer: user.customerId,
    });
  }
}
