import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthorSkinTone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
