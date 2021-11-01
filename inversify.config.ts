import { AsyncContainerModule } from 'inversify';
import { Repository } from 'typeorm';
import { Song } from './src/songs/entities/songs_entity';
import { TYPE } from './src/constants/types';
import { getSongsRepository } from './src/songs/repositories/songs_repository';
import { getDbConnection } from './db';
import { User } from './src/users/entities/users_entity';
import { getUsersRepository } from './src/users/repositories/users_repository';
import { Wishlist } from './src/wishlists/entities/wishlists_entity';
import { getWishlistsRepository } from './src/wishlists/repositories/wishlists_repository';
import { CartWithSongs } from './src/cartsWithsSongs/entities/carts_with_songs_entity';
import { getCartsWithSongsRepository } from './src/cartsWithsSongs/repositories/carts_with_songs_repository';
import { getGenreSongsRepository } from './src/songs/repositories/genre_songs_repository';
import { GenreSongs } from './src/songs/entities/genre_songs_entity';
import { AuthorSongs } from './src/songs/entities/author_songs_entity';
import { getAuthorSongsRepository } from './src/songs/repositories/author_songs_repository';
import { AuthorSkinTone } from './src/songs/entities/author_skintone_entity';
import { getAuthorSkinRepository } from './src/songs/repositories/author_skintone_repository';
import { AuthService } from './src/auth/services/auth_service';
import { CartsWithSongsService } from './src/cartsWithsSongs/services/carts_with_songs_service';
import { SongsService } from './src/songs/services/songs_service';
import { UsersService } from './src/users/services/users_service';
import { WishlistsService } from './src/wishlists/services/wishlists_service';
import { MailService } from './src/auth/services/mail_service';

export const bindings = new AsyncContainerModule(async (bind) => {
  await getDbConnection();
  await require('./src/users/controllers/users_controller');
  await require('./src/songs/controllers/songs_controller');
  await require('./src/wishlists/controllers/wishlists_controller');
  await require('./src/cartsWithsSongs/controllers/carts_with_songs_controller');
  await require('./src/auth/controllers/auth_controller');

  bind<Repository<User>>(TYPE.UserRepository)
    .toDynamicValue(() => {
      return getUsersRepository();
    })
    .inRequestScope();

  bind<Repository<Song>>(TYPE.SongRepository)
    .toDynamicValue(() => {
      return getSongsRepository();
    })
    .inRequestScope();

  bind<Repository<Wishlist>>(TYPE.WishlistRepository)
    .toDynamicValue(() => {
      return getWishlistsRepository();
    })
    .inRequestScope();

  bind<Repository<CartWithSongs>>(TYPE.CartWithSongsRepository)
    .toDynamicValue(() => {
      return getCartsWithSongsRepository();
    })
    .inRequestScope();

  bind<Repository<GenreSongs>>(TYPE.GenreSongsRepository)
    .toDynamicValue(() => {
      return getGenreSongsRepository();
    })
    .inRequestScope();

  bind<Repository<AuthorSongs>>(TYPE.AuthorSongsRepository)
    .toDynamicValue(() => {
      return getAuthorSongsRepository();
    })
    .inRequestScope();

  bind<Repository<AuthorSkinTone>>(TYPE.AuthorSkinRepository)
    .toDynamicValue(() => {
      return getAuthorSkinRepository();
    })
    .inRequestScope();

  bind<AuthService>(TYPE.AuthService).to(AuthService).inSingletonScope();

  bind<CartsWithSongsService>(TYPE.CartsWithSongsService)
    .to(CartsWithSongsService)
    .inSingletonScope();

  bind<SongsService>(TYPE.SongsService).to(SongsService).inSingletonScope();

  bind<UsersService>(TYPE.UsersService).to(UsersService).inSingletonScope();

  bind<WishlistsService>(TYPE.WishlistsService)
    .to(WishlistsService)
    .inSingletonScope();

  bind<MailService>(TYPE.MailService).to(MailService).inSingletonScope();
});
