import { controller, httpPost, requestBody } from 'inversify-express-utils';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { SignIn } from '../interfaces/sign_in_interface';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { User } from '../../users/entities/users_entity';
import { SignUp } from '../entities/sign_up_entity';
import { roleEnums } from '../../users/enums/role_enums';
import { Wishlist } from '../../wishlists/entities/wishlists_entity';
import { CartWithSongs } from '../../cartsWithsSongs/entities/carts_with_songs_entity';

@controller('/auth')
export class AuthController {
  private readonly _userRepository: Repository<User>;
  private readonly _wishlistRepository: Repository<Wishlist>;
  private readonly _cartWithSongsRepository: Repository<CartWithSongs>;

  constructor(
    @inject(TYPE.UserRepository) userRepository: Repository<User>,
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>,
    @inject(TYPE.CartWithSongsRepository)
    cartWithSongRepository: Repository<CartWithSongs>
  ) {
    this._userRepository = userRepository;
    this._wishlistRepository = wishlistRepository;
    this._cartWithSongsRepository = cartWithSongRepository;
  }

  @httpPost('/sign-in/')
  public async signIn(@requestBody() newSignIn: SignIn) {
    if (newSignIn.email && newSignIn.password) {
      const user = await this._userRepository.findOneOrFail({
        where: { email: newSignIn.email },
      });
      if (!user.checkIfUnencryptedPasswordIsValid(newSignIn.password)) {
        new Error(`Invalid password or email`);
      }
      const secretKey = process.env.SECRET_JWT || 'secret_jwt';
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        secretKey,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email },
        secretKey,
        { expiresIn: '1d' }
      );
      return { user, accessToken, refreshToken };
    }
  }

  @httpPost('/sign-up/')
  public async signUp(@requestBody() newSignUp: SignUp) {
    if (!newSignUp.role) {
      newSignUp.role = roleEnums.user;
    }
    if (!(await this._userRepository.findOne({ email: newSignUp.email }))) {
      const user = await this._userRepository.create(newSignUp);
      user.hashPassword();
      user.wishlist = await this._wishlistRepository.create({
        owner: user,
        listOfSongs: [],
      });
      user.cartWithSongs = await this._cartWithSongsRepository.create({
        owner: user,
        listOfSongs: [],
      });
      return this._userRepository.save(user);
    }
  }
}
