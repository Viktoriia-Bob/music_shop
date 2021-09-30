import { Column, Entity } from 'typeorm';
import { roleEnums } from '../../users/enums/role_enums';

@Entity()
export class SignUp {
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  username: string;
  @Column({ type: 'enum', enum: roleEnums, default: roleEnums.user })
  role: roleEnums;
}
