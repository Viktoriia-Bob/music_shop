import {
    controller,
    httpDelete,
    httpGet,
    httpPatch,
    httpPost,
    requestBody,
    requestParam,
    response
} from "inversify-express-utils";
import {Repository} from "typeorm";
import {User} from "../entities/users_entity";
import {inject} from "inversify";
import {TYPE} from "../../constants/types";
import * as express from 'express';

@controller('/users')
export class UsersController {
    private readonly _userRepository: Repository<User>
    constructor(@inject(TYPE.UserRepository) userRepository: Repository<User>) {
        this._userRepository = userRepository;
    }
    @httpGet('/')
    public async getUsers(@response() res: express.Response) {
        return this._userRepository.find();
    }
    @httpPost('/')
    public async createUser(@response() res: express.Response,
                            @requestBody() newUser: User) {
        return this._userRepository.save(this._userRepository.create(newUser));
    }
    @httpPatch('/:id')
    public async updateUser(@response() res: express.Response,
                            @requestBody() updateUser: User,
                            @requestParam('id') idParam: number) {
        return this._userRepository.update({id: idParam}, updateUser);
    }
    @httpDelete('/:id')
    public async removeUser(@response() res: express.Response,
                            @requestParam('id') idParam: number) {
        await this._userRepository.delete({id: idParam});
    }
}