import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { roleEnums } from '../../users/enums/role_enums';

@Entity()
export class SignUp {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  username: string;
  @Column({ type: 'enum', enum: roleEnums, default: roleEnums.user })
  role: roleEnums;
}
