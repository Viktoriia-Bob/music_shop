import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {roleEnums} from "../enums/role_enums";

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
}