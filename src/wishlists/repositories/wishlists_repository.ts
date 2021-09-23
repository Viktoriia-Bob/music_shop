import {getConnection} from "typeorm";
import {Wishlist} from "../entities/wishlists_entity";

export function getWishlistsRepository() {
    const conn = getConnection();
    return conn.getRepository(Wishlist);
}