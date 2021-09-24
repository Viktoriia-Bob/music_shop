import { getConnection } from 'typeorm';
import { Song } from '../entities/songs_entity';

export function getSongsRepository() {
    const conn = getConnection();
    return conn.getRepository(Song);
}