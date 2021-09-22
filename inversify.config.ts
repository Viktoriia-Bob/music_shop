import {AsyncContainerModule} from "inversify";
import {Repository} from "typeorm";
import {Song} from "./src/songs/entities/songs_entity";
import {TYPE} from './src/constants/types';
import { getRepository } from './src/songs/repositories/songs_repository';
import {getDbConnection} from "./db";

export const bindings = new AsyncContainerModule(async (bind) => {
    await getDbConnection();
    await require('./src/songs/controllers/songs_controller');
    bind<Repository<Song>>(TYPE.SongRepository).toDynamicValue(() => {
        return getRepository();
    }).inRequestScope();
})