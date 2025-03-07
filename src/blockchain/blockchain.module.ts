import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PlayerModule],
  providers: [BlockchainService],
})
export class BlockchainModule {}
