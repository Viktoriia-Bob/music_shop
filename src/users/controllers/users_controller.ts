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
import { inject } from 'inversify';

import { TYPE } from '../../constants/types';
import { User } from '../entities/users_entity';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { UserValidator } from '../validation/users_validation';
import { checkJwt } from '../../middlewares/check_jwt_middleware';
import { roleEnums } from '../enums/role_enums';
import { checkRole } from '../../middlewares/check_role_middleware';
import { UsersService } from '../services/users_service';

@controller('/users', checkJwt())
export class UsersController {
  constructor(@inject(TYPE.UsersService) private usersService: UsersService) {}

  @httpGet('/', checkRole(roleEnums.admin))
  public async getUsers(
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99
  ) {
    return this.usersService.getUsers(skip, take);
  }

  @httpGet('/get-user/:id')
  public async getUserById(@requestParam('id') idParam: number) {
    return this.usersService.getUserById(idParam);
  }

  @httpPost(
    '/',
    ValidationMiddleware(UserValidator),
    checkJwt(),
    checkRole(roleEnums.admin)
  )
  public async createUser(@requestBody() newUser: User) {
    return this.usersService.createUser(newUser);
  }

  @httpPatch('/:id', ValidationMiddleware(UserValidator))
  public async updateUser(
    @requestBody() updateUser: User,
    @requestParam('id') idParam: number
  ) {
    return this.usersService.updateUser(updateUser, idParam);
  }

  @httpDelete('/:id')
  public async removeUser(@requestParam('id') idParam: number) {
    await this.usersService.removeUser(idParam);
  }

  @httpGet('/list-of-bought-songs')
  public async listOfBoughtSongs(
    @response() res: Response,
    @queryParam('skip') skip = 0,
    @queryParam('take') take = 99,
    @queryParam('list') list = false
  ) {
    const id = res.locals.jwtPayload.userId;
    return this.usersService.listOfBoughtSongs(id, skip, take, list);
  }

  @httpPut('/block-user/:id', checkJwt(), checkRole(roleEnums.admin))
  public async blockUser(@requestParam('id') id: number) {
    return this.usersService.blockUser(id);
  }

  @httpPost('/buy-song')
  public async buySong(@response() res: Response, @requestBody() body) {
    const id = res.locals.jwtPayload.userId;
    return this.usersService.buySong(id, body);
  }

  @httpPut('/update-user-role/:id', checkJwt(), checkRole(roleEnums.admin))
  public async updateUserRole(
    @requestParam('id') id: number,
    @requestBody() { role }
  ) {
    return this.usersService.updateUserRole(id, role);
  }

  @httpPost('/add-song-to-bought')
  public async addSongToBought(@response() res: Response, @requestBody() body) {
    const id = await res.locals.jwtPayload.userId;
    return this.usersService.addSongToBought(id, body.ids);
  }

  @httpGet('/payments/:id')
  public async payments(@requestParam('id') id) {
    return this.usersService.payments(id);
  }
}
