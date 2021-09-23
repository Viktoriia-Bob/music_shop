import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {roleEnums} from "../enums/role_enums";
import {Wishlist} from "../../wishlists/entities/wishlists_entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column()
    public username!: string;
    @Column()
    public email!: string;
    @Column('text')
    public role!: roleEnums;
    @Column({default: false})
    public isBlocked!: boolean;
    @OneToMany(type => Wishlist, wishlist => wishlist.owner)
    public wishlist: Wishlist[];
}