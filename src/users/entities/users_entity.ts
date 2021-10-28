import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { roleEnums } from '../enums/role_enums';
import { Wishlist } from '../../wishlists/entities/wishlists_entity';
import { CartWithSongs } from '../../cartsWithsSongs/entities/carts_with_songs_entity';
import { Song } from '../../songs/entities/songs_entity';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  public username!: string;
  @Column({ unique: true })
  public email!: string;
  @Column()
  public password!: string;
  @Column({ type: 'enum', enum: roleEnums, default: roleEnums.user })
  public role!: roleEnums;
  @Column({ default: false })
  public isBlocked!: boolean;
  @OneToOne(() => Wishlist, (wishlist) => wishlist.owner, { cascade: true })
  @JoinColumn({ name: 'wishlistId' })
  public wishlist: Wishlist;
  @OneToOne(() => CartWithSongs, (cart) => cart.owner, { cascade: true })
  @JoinColumn({ name: 'cartId' })
  public cartWithSongs: CartWithSongs;
  @ManyToMany(() => Song)
  @JoinTable({ name: 'boughtSongsId' })
  public boughtSongs: Song[];
  @Column()
  public customerId: string;
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }
  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
