import {AsyncContainerModule} from "inversify";
import {Repository} from "typeorm";
import {Song} from "./src/songs/entities/songs_entity";
import {TYPE} from './src/constants/types';
import { getSongsRepository } from './src/songs/repositories/songs_repository';
import {getDbConnection} from "./db";
import {User} from "./src/users/entities/users_entity";
import {getUsersRepository} from "./src/users/repositories/users_repository";

export const bindings = new AsyncContainerModule(async (bind) => {
    await getDbConnection();
    await require('./src/users/controllers/users_controller');
    await require('./src/songs/controllers/songs_controller');

    bind<Repository<User>>(TYPE.UserRepository).toDynamicValue(() => {
        return getUsersRepository();
    }).inRequestScope();
    bind<Repository<Song>>(TYPE.SongRepository).toDynamicValue(() => {
        return getSongsRepository();
    }).inRequestScope();
})