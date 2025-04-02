import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['salt'])
export class Salted {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    unique: true,
    type: 'int',
    name: 'salted',
    default: 10,
  })
  salt!: number;
}
