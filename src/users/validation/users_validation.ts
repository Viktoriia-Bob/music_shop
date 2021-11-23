import {
  IsBoolean,
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

  @IsBoolean()
  @IsNotEmpty()
  verify;

  @IsOptional()
  @IsString()
  phoneNumber;

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
