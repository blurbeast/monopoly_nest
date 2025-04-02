import { IsString } from 'class-validator';

export class CreatePlayerResponseDto {
  constructor(
    username: string,
    playerAddress: string,
    smartAccountAddress: string,
  ) {
    this.username = username;
    this.playerAddress = playerAddress;
    this.smartAccountAddress = smartAccountAddress;
  }

  @IsString()
  username!: string;
  @IsString()
  playerAddress!: string;
  @IsString()
  smartAccountAddress!: string;
}
