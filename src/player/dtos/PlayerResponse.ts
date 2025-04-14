import { Expose } from 'class-transformer';

export class PlayerResponse {
  @Expose()
  username!: string;
  @Expose()
  smartAccountAddress!: string;
  @Expose()
  playerAddress!: string;
  @Expose()
  currentGameId!: string;
  @Expose()
  createdAt!: Date;
}
