import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  phoneNumber;

  @IsNotEmpty()
  password;
}
