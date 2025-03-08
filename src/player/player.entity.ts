import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('player')
export class Player {
  @PrimaryGeneratedColumn('identity')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 100, name: 'player_username' })
  username: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  smartAccountAddress: string;

  @Column({ unique: true, type: 'varchar', length: 42 })
  walletAddress: string;

  @Column()
  currentGameId: string;

  @Column({ name: "player_joined_at", type: 'timestamp' })
  createdAt: Date;

}
