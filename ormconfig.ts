import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'secret',
  database: process.env.POSTGRES_DB || 'music_shop',
  synchronize: true,
  entities: ['./src/*/entities/*_entity{.ts,.js}'],
  // entities: [__dirname + '/src/*/entities/*_entity{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = config;
