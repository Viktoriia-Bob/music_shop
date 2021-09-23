import {
    controller,
    httpDelete,
    httpGet,
    httpPatch,
    httpPost,
    requestBody,
    requestParam
} from "inversify-express-utils";
import {Repository} from "typeorm";
import {User} from "../entities/users_entity";
import {inject} from "inversify";
import {TYPE} from "../../constants/types";

@controller('/users')
export class UsersController {
    private readonly _userRepository: Repository<User>
    constructor(@inject(TYPE.UserRepository) userRepository: Repository<User>) {
        this._userRepository = userRepository;
    }
    @httpGet('/')
    public async getUsers() {
        return this._userRepository.find();
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
    public async updateUser(@requestBody() updateUser: User,
                            @requestParam('id') idParam: number) {
        return this._userRepository.update({id: idParam}, updateUser);
    }
    @httpDelete('/:id')
    public async removeUser(@requestParam('id') idParam: number) {
        await this._userRepository.delete({id: idParam});
    }
}