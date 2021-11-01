import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import Stripe from 'stripe';
// import * as nodemailer from 'nodemailer';

import { User } from '../../users/entities/users_entity';
import { Wishlist } from '../../wishlists/entities/wishlists_entity';
import { CartWithSongs } from '../../cartsWithsSongs/entities/carts_with_songs_entity';
import { TYPE } from '../../constants/types';
import { SignInDto } from '../dto/sign_in_dto';
import { SignUpDto } from '../dto/sign_up_dto';
import { roleEnums } from '../../users/enums/role_enums';
import { MailService } from './mail_service';

@injectable()
export class AuthService {
  private readonly _userRepository: Repository<User>;
  private readonly _wishlistRepository: Repository<Wishlist>;
  private readonly _cartWithSongsRepository: Repository<CartWithSongs>;
  private stripe: Stripe;
  // private _transporter: nodemailer.Transporter;
  // private readonly emailUser = process.env.EMAIL_FOR_MAIL;
  // private readonly passwordEmail = process.env.PASSWORD_FOR_MAIL;

  constructor(
    @inject(TYPE.UserRepository) userRepository: Repository<User>,
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>,
    @inject(TYPE.CartWithSongsRepository)
    cartWithSongRepository: Repository<CartWithSongs>,
    @inject(TYPE.MailService) private mailService: MailService
  ) {
    this._userRepository = userRepository;
    this._wishlistRepository = wishlistRepository;
    this._cartWithSongsRepository = cartWithSongRepository;
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
    // this._transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: this.emailUser,
    //     pass: this.passwordEmail,
    //   },
    // });
  }

  public async signIn(newSignIn: SignInDto) {
    const user = await this._userRepository.findOneOrFail({
      where: { email: newSignIn.email },
    });

    if (!user.emailVerify) {
      return `email not verified`;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(newSignIn.password)) {
      new Error(`Invalid password or email`);
    }

    const secretKey = process.env.SECRET_JWT;

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '7d' }
    );

    return { user, accessToken, refreshToken };
  }

  public async signUp(newSignUp: SignUpDto) {
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
      const CreateCustomer = async () => {
        const params: Stripe.CustomerCreateParams = {
          email: user.email,
          name: user.username,
        };
        const customer: Stripe.Customer = await this.stripe.customers.create(
          params
        );
        user.customerId = customer.id;
      };
      await CreateCustomer();
      await this._userRepository.save(user);
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.SECRET_JWT,
        { expiresIn: '1h' }
      );
      await this.mailService.sendSmsConfirmation();
      await this.mailService.sendConfirmation(user, token);
      return { sendToEmail: true };
    }
    return { exists: true, info: `User is exists` };
  }

  public async confirmToken(token) {
    let jwtPayload = jwt.verify(token, process.env.SECRET_JWT);
    const user = await this._userRepository.findOne(jwtPayload.userId);
    if (user) {
      user.emailVerify = true;
      await this._userRepository.save(user);
      return { confirm: true };
    }
  }
}
