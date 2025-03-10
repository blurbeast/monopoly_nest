import { Column, Entity, IntegerType, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player')
export class Player {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
    name: 'player_username',
  })
  username!: string; // the ! tells the compiler that the value of that field would be initalized later 

  @Column({ unique: true, type: 'varchar', length: 42 })
  smartAccountAddress!: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  playerAddress!: string;

  @Column({ nullable: true, type: 'int' })
  currentGameId!: number;

  @Column({ name: 'player_joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
