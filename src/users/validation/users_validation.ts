import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { roleEnums } from '../enums/role_enums';

export class UserValidator {
  @IsInt()
  @IsOptional()
  id?;
  @IsString()
  username;
  @IsEmail()
  email;
  @IsString()
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
}
