import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  public name!: string;
  @Column()
  public genre!: string;
  @Column()
  public author!: string;
  @Column({ type: 'float', default: 0.0 })
  public price!: number;
  @Column({ default: 'https://picsum.photos/200' })
  public image?: string;
}
