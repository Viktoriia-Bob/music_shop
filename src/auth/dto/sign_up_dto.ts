import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { roleEnums } from '../../users/enums/role_enums';

export class SignUpDto {
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
  @IsOptional()
  @IsEnum(roleEnums)
  role;
}
