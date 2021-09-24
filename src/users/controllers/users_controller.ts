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
import { User } from '../entities/users_entity';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { Song } from '../../songs/entities/songs_entity';

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

  @httpGet('/')
  public async getUsers() {
    await this._songRepository.find();
    return this._userRepository.find({ take: 10 });
  }

  @httpGet('/:id')
  public async getUserById(@requestParam('id') idParam: number) {
    return this._userRepository.findOne({ id: idParam });
  }

  @httpPost('/')
  public async createUser(@requestBody() newUser: User) {
    return this._userRepository.save(this._userRepository.create(newUser));
  }

  @httpPatch('/:id')
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

  @httpGet('/list-of-bought-song/:id')
  public async listOfBoughtSongs(@requestParam('id') id: number) {
    return this._userRepository.findOne({ id }, { select: ['boughtSongs'] });
  }
}
