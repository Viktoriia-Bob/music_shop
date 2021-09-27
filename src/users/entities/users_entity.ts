import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { roleEnums } from '../enums/role_enums';
import { Wishlist } from '../../wishlists/entities/wishlists_entity';
import { CartWithSongs } from '../../cartsWithsSongs/entities/carts_with_songs_entity';
import { Song } from '../../songs/entities/songs_entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  public username!: string;
  @Column()
  public email!: string;
  @Column()
  public password!: string;
  @Column('text')
  public role!: roleEnums;
  @Column({ default: false })
  public isBlocked!: boolean;
  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  public wishlist: Wishlist[];
  @OneToOne(() => CartWithSongs, (cart) => cart.owner)
  @JoinColumn({ name: 'cartId' })
  public cartWithSongs: CartWithSongs[];
  @ManyToMany(() => Song)
  @JoinTable({ name: 'boughtSongsId ' })
  public boughtSongs: Song[];
}
