import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GenreSongs {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
