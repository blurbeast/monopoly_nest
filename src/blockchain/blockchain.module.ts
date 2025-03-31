import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { ViemModule } from '../viemM/viem.module';
import { EthersMModule } from '../ethers-m/ethers-m.module';

@Module({
  imports: [ViemModule, EthersMModule],
  providers: [BlockchainService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
