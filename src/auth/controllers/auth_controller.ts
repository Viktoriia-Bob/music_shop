import {
  controller,
  httpGet,
  httpPost,
  queryParam,
  requestBody,
} from 'inversify-express-utils';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { User } from '../../users/entities/users_entity';
import { roleEnums } from '../../users/enums/role_enums';
import { Wishlist } from '../../wishlists/entities/wishlists_entity';
import { CartWithSongs } from '../../cartsWithsSongs/entities/carts_with_songs_entity';
import { SignInDto } from '../dto/sign_in_dto';
import { SignUpDto } from '../dto/sign_up_dto';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import * as nodemailer from 'nodemailer';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  typescript: true,
});

@controller('/auth')
export class AuthController {
  private readonly _userRepository: Repository<User>;
  private readonly _wishlistRepository: Repository<Wishlist>;
  private readonly _cartWithSongsRepository: Repository<CartWithSongs>;
  private _transporter: nodemailer.Transporter;
  private readonly emailUser = process.env.EMAIL_FOR_MAIL;
  private readonly passwordEmail = process.env.PASSWORD_FOR_MAIL;

  constructor(
    @inject(TYPE.UserRepository) userRepository: Repository<User>,
    @inject(TYPE.WishlistRepository) wishlistRepository: Repository<Wishlist>,
    @inject(TYPE.CartWithSongsRepository)
    cartWithSongRepository: Repository<CartWithSongs>
  ) {
    this._userRepository = userRepository;
    this._wishlistRepository = wishlistRepository;
    this._cartWithSongsRepository = cartWithSongRepository;
    this._transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailUser,
        pass: this.passwordEmail,
      },
    });
  }

  @httpPost('/sign-in/', ValidationMiddleware(SignInDto))
  public async signIn(@requestBody() newSignIn: SignInDto) {
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
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      secretKey,
      { expiresIn: '1d' }
    );
    return { user, accessToken, refreshToken };
  }

  @httpPost('/sign-up/', ValidationMiddleware(SignUpDto))
  public async signUp(@requestBody() newSignUp: SignUpDto) {
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
        const customer: Stripe.Customer = await stripe.customers.create(params);
        user.customerId = customer.id;
      };
      await CreateCustomer();
      await this._userRepository.save(user);
      await this.sendConfirmation(user.id);
      return user;
    }
  }

  @httpGet('/confirm')
  public async confirmToken(@queryParam('token') token) {
    let jwtPayload = jwt.verify(token, process.env.SECRET_JWT);
    const user = await this._userRepository.findOne(jwtPayload.userId);
    if (user) {
      user.emailVerify = true;
      return this._userRepository.save(user);
    }
  }

  public async sendConfirmation(id: number) {
    const user = await this._userRepository.findOne(id);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.SECRET_JWT,
      { expiresIn: '1h' }
    );
    const confirmLink = `http://localhost:3000/auth/confirm?token=${token}`;
    let info = await this._transporter.sendMail({
      from: `"Music Shop" <${process.env.EMAIL_FOR_MAIL}>`,
      to: user.email,
      subject: 'Verify User',
      html: `
        <h3>Hello, ${user.username}!</h3>
        <p>Please use this <a href="${confirmLink}">link</a> to confirm your account</p>
        `,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  }
}
