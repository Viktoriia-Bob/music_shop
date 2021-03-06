import {
  IsEnum,
  IsNotEmpty,
  // IsNumber,
  IsOptional,
  // IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { roleEnums } from '../../users/enums/role_enums';

export class SignUpDto {
  @IsString()
  // @IsPhoneNumber('UA')
  @IsNotEmpty()
  @Matches(
    /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm,
    { message: 'Weak phone number' }
  )
  phoneNumber;

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
