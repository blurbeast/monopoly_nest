import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('player')
@Unique(['username'])
@Unique(['playerAddress'])
@Unique(['smartAccountAddress'])
export class Player {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
    name: 'player_username',
  })
  username!: string; // the ! tells the compiler that the value of that field would be initialized later

  @Column({ unique: true, type: 'varchar', length: 42 })
  smartAccountAddress!: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  playerAddress!: string;

  @Column({ unique: true, type: 'int' })
  userSalt!: number;

  @Column({ nullable: true, type: 'int' })
  currentGameId!: number;

  @Column({
    name: 'player_joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
