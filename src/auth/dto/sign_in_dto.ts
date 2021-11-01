import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  email;

  @IsNotEmpty()
  password;
}
