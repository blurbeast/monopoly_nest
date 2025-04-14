import { GameStatus, Position } from '../game.entity';
import { Expose } from 'class-transformer';

export class GameResponse {
  @Expose()
  hasStarted!: boolean;
  @Expose()
  gameRoomId!: string;
  @Expose()
  playerToAddress!: {
    [key: string]: { smartAccountAddress: string; joined: boolean };
  };
  @Expose()
  numberOfPlayers!: number;
  @Expose()
  bankContractAddress!: string;
  @Expose()
  createdAt!: Date;
  @Expose()
  currentTurn!: string;
  @Expose()
  playerPositions!: Position[];
  @Expose()
  status!: GameStatus;
  @Expose()
  endedAt!: Date;
}
