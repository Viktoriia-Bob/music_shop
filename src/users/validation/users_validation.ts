import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { roleEnums } from '../enums/role_enums';

export class UserValidator {
  @IsInt()
  @IsOptional()
  id?;

  @IsString()
  @IsNotEmpty()
  username;

  @IsEmail()
  @IsNotEmpty()
  email;

  @IsBoolean()
  @IsNotEmpty()
  emailVerify;

  @IsString()
  @IsNotEmpty()
  password;

  @IsOptional()
  @IsEnum(roleEnums)
  role?;

  @IsBoolean()
  @IsOptional()
  isBlocked?;

  @IsOptional()
  wishlist?;

  @IsOptional()
  cartWithSongs?;

  @IsOptional()
  boughtSongs?;

  @IsOptional()
  customerId;
}
