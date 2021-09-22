import {Song} from "./src/songs/entities/songs_entity";
import {createConnection} from "typeorm";

export async function getDbConnection() {
    const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
    const DATABASE_USER = process.env.DATABASE_USER || '';
    const DATABASE_PORT = 5432;
    const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';
    const DATABASE_DB = process.env.DATABASE_DB || '';

    const entities = [
        Song
    ];

    return createConnection({
        type: 'postgres',
        host: DATABASE_HOST,
        port: DATABASE_PORT,
        username: DATABASE_USER,
        password: DATABASE_PASSWORD,
        database: DATABASE_DB,
        entities: entities,
        synchronize: true
    });
}