import {getConnection} from "typeorm";
import {User} from "../entities/users_entity";

export function getUsersRepository() {
    const conn = getConnection();
    return conn.getRepository(User);
}