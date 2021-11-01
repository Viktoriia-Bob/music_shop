import {
  controller,
  httpGet,
  httpPost,
  queryParam,
  requestBody,
} from 'inversify-express-utils';
import { inject } from 'inversify';

import { TYPE } from '../../constants/types';
import { SignInDto } from '../dto/sign_in_dto';
import { SignUpDto } from '../dto/sign_up_dto';
import { ValidationMiddleware } from '../../middlewares/validation_middleware';
import { AuthService } from '../services/auth_service';

@controller('/auth')
export class AuthController {
  constructor(@inject(TYPE.AuthService) private authService: AuthService) {}

  @httpPost('/sign-in/', ValidationMiddleware(SignInDto))
  public async signIn(@requestBody() newSignIn: SignInDto) {
    return this.authService.signIn(newSignIn);
  }

  @httpPost('/sign-up/', ValidationMiddleware(SignUpDto))
  public async signUp(@requestBody() newSignUp: SignUpDto) {
    return this.authService.signUp(newSignUp);
  }

  @httpGet('/confirm')
  public async confirmToken(@queryParam('token') token) {
    return this.authService.confirmToken(token);
  }
}
