import { controller, httpPost, requestBody } from 'inversify-express-utils';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { SignIn } from '../entities/sign_in_entity';
import { inject } from 'inversify';
import { TYPE } from '../../constants/types';
import { User } from '../../users/entities/users_entity';
import { SignUp } from '../entities/sign_up_entity';
import { roleEnums } from '../../users/enums/role_enums';

@controller('/auth')
export class AuthController {
  private readonly _userRepository: Repository<User>;

  constructor(@inject(TYPE.UserRepository) userRepository: Repository<User>) {
    this._userRepository = userRepository;
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
      return this._userRepository.save(user);
    }
  }
}
