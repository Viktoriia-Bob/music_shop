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

@controller('/users')
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

  @httpGet('/', checkJwt(), checkRole(roleEnums.admin))
  public async getUsers() {
    return this._userRepository.find({ skip: 0, take: 10 });
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
    console.log(newUser);
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

  @httpGet('/list-of-bought-songs/:id')
  public async listOfBoughtSongs(@requestParam('id') id: number) {
    const list = await this._userRepository.findOne(id, {
      relations: ['boughtSongs'],
    });
    return list.boughtSongs;
  }

  @httpPut('/block-user/:id', checkJwt(), checkRole(roleEnums.admin))
  public async blockUser(@requestParam('id') id: number) {
    const user = await this._userRepository.findOne({ id });
    user.isBlocked = user.isBlocked === false;
    return this._userRepository.save(user);
  }

  @httpPost('/buy-song')
  public async buySong(
    @queryParam('userId') userId: number,
    @queryParam('songId') songId: number,
    @response() res: Response
  ) {
    const user = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs'],
    });
    const song = await this._songRepository.findOne(songId);

    if (user.boughtSongs.map((songBought) => songBought.id).includes(song.id)) {
      return `This song already exist in your collection`;
    }
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: song.price,
            currency: 'usd',
            product_data: {
              name: song.name,
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
      success_url: `http://localhost:3000/users/add-song-to-bought/${song.id}/user/${user.id}`,
      cancel_url: `http://localhost:3000/users/buy-song?userId=${user.id}&songId=${songId}`,
    });
    console.log(session.url);
    res.redirect(303, session.url);
  }

  @httpPut('/transfer-to-admin/:id', checkJwt(), checkRole(roleEnums.admin))
  public async transferToAdmin(@requestParam('id') id: number) {
    const user = await this._userRepository.findOne(id);
    user.role = roleEnums.admin;
    return this._userRepository.save(user);
  }

  @httpGet('/add-song-to-bought/:songId/user/:userId')
  public async addSongToBought(
    @requestParam('songId') songId: number,
    @requestParam('userId') userId: number
  ) {
    const song = await this._songRepository.findOne(songId);
    const user = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs'],
    });
    user.boughtSongs.push(song);
    return this._userRepository.save(user);
  }
}
