import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import Stripe from 'stripe';

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
  }

  public async signIn(newSignIn: SignInDto) {
    newSignIn.phoneNumber = newSignIn.phoneNumber.replace(/\D+/g, '');
    const user = await this._userRepository.findOneOrFail({
      where: { phoneNumber: newSignIn.phoneNumber },
    });

    if (!user.verify) {
      return `phone not verified`;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(newSignIn.password)) {
      new Error(`Invalid password or email`);
    }

    const secretKey = process.env.SECRET_JWT;

    const accessToken = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      secretKey,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      secretKey,
      { expiresIn: '7d' }
    );

    return { user, accessToken, refreshToken };
  }

  public async signUp(newSignUp: SignUpDto) {
    newSignUp.phoneNumber = newSignUp.phoneNumber.replace(/\D+/g, '');
    if (!newSignUp.role) {
      newSignUp.role = roleEnums.user;
    }
    if (
      !(await this._userRepository.findOne({
        phoneNumber: newSignUp.phoneNumber,
      }))
    ) {
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
          phone: user.phoneNumber.toString(),
          name: user.username,
        };
        const customer: Stripe.Customer = await this.stripe.customers.create(
          params
        );
        user.customerId = customer.id;
      };
      await CreateCustomer();
      await this._userRepository.save(user);
      await this.mailService.sendSmsConfirmation(user);
      return { sendSms: true };
    }
    return { exists: true, info: `User is exists` };
  }

  public async confirmCode(phoneNumber, code) {
    phoneNumber = phoneNumber.replace(/\D+/g, '');
    const user = await this._userRepository.findOne({
      phoneNumber: phoneNumber,
    });
    const { confirm } = await this.mailService.checkCodeVerification(
      phoneNumber,
      code
    );
    if (confirm) {
      user.verify = true;
      await this._userRepository.save(user);
      return { confirm: true };
    }
  }
}
