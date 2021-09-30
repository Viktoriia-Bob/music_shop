import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpValidator {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email;
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: 'Weak password' }
  )
  password;
  @IsString()
  @IsNotEmpty()
  username;
}
