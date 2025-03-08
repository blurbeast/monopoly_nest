import { Column, Entity, IntegerType, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player')
export class Player {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
    name: 'player_username',
  })
  username: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  smartAccountAddress: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  walletAddress: string;

  @Column({ nullable: true, type: 'bigint' })
  currentGameId: number;

  @Column({ name: 'player_joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
