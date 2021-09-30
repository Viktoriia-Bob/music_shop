import { Column, Entity } from 'typeorm';

@Entity()
export class SignIn {
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
}
