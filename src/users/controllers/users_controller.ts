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
import { User } from '../entities/users_entity';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { UserValidator } from '../validation/users_validation';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { roleEnums } from '../enums/role_enums';
import { Song } from '../../songs/entities/songs_entity';
import { checkRole } from '../../middlewares/check_role_middleware';

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
  public async getUsers(
    @queryParam('page') page = 1,
    @queryParam('limit') limit = 10
  ) {
    if (limit < 100) {
      return this._userRepository.find({ skip: (page - 1) * 10, take: limit });
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
    @queryParam('songId') songId: number
  ) {
    const user = await this._userRepository.findOne(userId, {
      relations: ['boughtSongs'],
    });
    const song = await this._songRepository.findOne(songId);
    user.boughtSongs.push(song);
    return this._userRepository.save(user);
  }

  @httpPut('/transfer-to-admin/:id', checkJwt(), checkRole(roleEnums.admin))
  public async transferToAdmin(@requestParam('id') id: number) {
    const user = await this._userRepository.findOne(id);
    user.role = roleEnums.admin;
    return this._userRepository.save(user);
  }
}
