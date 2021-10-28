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
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/users_entity';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { UserValidator } from '../validation/users_validation';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { roleEnums } from '../enums/role_enums';
import { Song } from '../../songs/entities/songs_entity';
import { checkRole } from '../../middlewares/check_role_middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  typescript: true,
});

@controller('/users', checkJwt())
export class UsersController {
  private readonly _userRepository: Repository<User>;
  private readonly _songRepository: Repository<Song>;

  constructor(
    @inject(TYPE.UserRepository) userRepository: Repository<User>,
    @inject(TYPE.SongRepository) songRepository: Repository<Song>
  ) {
    this._userRepository = userRepository;
    this._songRepository = songRepository;
  }

  @httpGet('/', checkRole(roleEnums.admin))
  public async getUsers(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
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

  @httpGet('/get-user/:id')
  public async getUserById(@requestParam('id') idParam: number) {
    return this._userRepository.findOne(idParam);
  }

  @httpPost(
    '/',
    ValidationMiddleware(UserValidator),
    checkJwt(),
    checkRole(roleEnums.admin)
  )
  public async createUser(@requestBody() newUser: User) {
    if (!newUser.role) {
      newUser.role = roleEnums.user;
    }
    const user = this._userRepository.create(newUser);
    user.hashPassword();
    return this._userRepository.save(user);
  }

  @httpPatch('/:id', ValidationMiddleware(UserValidator))
  public async updateUser(
    @requestBody() updateUser: User,
    @requestParam('id') idParam: number
  ) {
    return this._userRepository.update({ id: idParam }, updateUser);
  }

  @httpDelete('/:id')
  public async removeUser(@requestParam('id') idParam: number) {
    await this._userRepository.delete({ id: idParam });
  }

  @httpGet('/list-of-bought-songs/')
  public async listOfBoughtSongs(
    @response() res: Response,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    const id = res.locals.jwtPayload.userId;
    const list = await this._userRepository.findOne(id, {
      relations: ['boughtSongs'],
    });
    return this._songRepository.findByIds(
      [...list.boughtSongs.map((song) => song.id)],
      { relations: ['author', 'genre'], take: take, skip: skip }
    );
  }

  @httpPut('/block-user/:id', checkJwt(), checkRole(roleEnums.admin))
  public async blockUser(@requestParam('id') id: number) {
    const user = await this._userRepository.findOne({ id });
    user.isBlocked = user.isBlocked === false;
    return this._userRepository.save(user);
  }

  @httpPost('/buy-song')
  public async buySong(@response() res: Response, @requestBody() body) {
    const id = res.locals.jwtPayload.userId;
    const user = await this._userRepository.findOne(id, {
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
    const session = await stripe.checkout.sessions.create({
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
      payment_intent_data: {
        receipt_email: user.email,
      },
      customer: user.customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `http://localhost:3000/confirm-payload`,
      cancel_url: `http://localhost:3000`,
    });
    return { url: session.url };
  }

  @httpPut('/transfer-to-admin/:id', checkJwt(), checkRole(roleEnums.admin))
  public async transferToAdmin(@requestParam('id') id: number) {
    const user = await this._userRepository.findOne(id);
    if (user.role === roleEnums.admin) {
      user.role = roleEnums.user;
    } else {
      user.role = roleEnums.admin;
    }
    return this._userRepository.save(user);
  }

  @httpGet('/add-song-to-bought')
  public async addSongToBought(@response() res: Response) {
    const id = await res.locals.jwtPayload.userId;
    const user = await this._userRepository.findOne(id, {
      relations: ['boughtSongs', 'cartWithSongs', 'cartWithSongs.listOfSongs'],
    });
    const songs = user.cartWithSongs.listOfSongs;
    user.boughtSongs.push(...songs);
    user.cartWithSongs.listOfSongs = [];
    return this._userRepository.save(user);
  }
}
