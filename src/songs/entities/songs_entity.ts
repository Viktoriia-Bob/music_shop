import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Song {
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column()
    public title!: string;
}