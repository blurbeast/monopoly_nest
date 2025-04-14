import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreatePlayerResponseDto {
  @IsString()
  @Expose()
  username!: string;
  @IsString()
  @Expose()
  playerAddress!: string;
  @IsString()
  @Expose()
  smartAccountAddress!: string;
}
