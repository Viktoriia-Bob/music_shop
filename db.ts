import { Song } from './src/songs/entities/songs_entity';
import { createConnection } from 'typeorm';
import { User } from './src/users/entities/users_entity';
import { Wishlist } from './src/wishlists/entities/wishlists_entity';
import { CartWithSongs } from './src/cartsWithsSongs/entities/carts_with_songs_entity';

export async function getDbConnection() {
  const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
  const DATABASE_USER = process.env.DATABASE_USER || 'postgres';
  const DATABASE_PORT = 5432;
  const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'secret';
  const DATABASE_DB = process.env.DATABASE_DB || 'music_shop';

  const entities = [Song, User, Wishlist, CartWithSongs];

  return createConnection({
    type: 'postgres',
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_DB,
    entities: entities,
    synchronize: false,
    migrations: ['./src/migration/*.ts'],
    cli: { migrationsDir: './src/migration' },
  });
}
