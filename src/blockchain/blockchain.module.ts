import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { PlayerModule } from 'src/player/player.module';
import { BlockchainController } from './blockchain.controller';

@Module({
    // imports: [PlayerModule],
    providers: [BlockchainService],
    controllers: [BlockchainController],
    exports: [BlockchainService]
})
export class BlockchainModule { }
