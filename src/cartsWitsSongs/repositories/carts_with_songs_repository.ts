import {getConnection} from "typeorm";
import {CartWithSongs} from "../entities/carts_with_songs_entity";

export function getCartsWithSongsRepository() {
    const conn = getConnection();
    return conn.getRepository(CartWithSongs);
}