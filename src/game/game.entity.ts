import { Player } from '../player/player.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum GameStatus {
  PENDING, // 0
  ACTIVE, // 1
  ENDED, // 2
}

class Position {
  player!: string;
  spot!: number;
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'boolean', default: false })
  hasStarted!: boolean;

  @Column({ unique: true, type: 'varchar', length: 5 })
  gameRoomId!: string;

  @OneToMany(() => Player, (player) => player.currentGameId, { cascade: true })
  players!: Player[];

  @Column({ type: 'int' })
  numberOfPlayers!: number;

  @Column({ unique: true, length: 42, type: 'varchar' })
  bankContractAddress!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ type: 'varchar' })
  currentTurn!: string;

  @Column({ type: 'jsonb', name: 'player_position', nullable: true })
  playerPositions!: Position[];

  @Column({
    enum: GameStatus,
    name: 'game_status',
    enumName: 'game_status_enum',
    type: 'enum',
    default: GameStatus.PENDING,
  })
  status!: GameStatus;

  @Column({ type: 'timestamp', name: 'ended_time', nullable: true })
  endedAt!: Date;
}
