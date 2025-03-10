import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), BlockchainModule,],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService,],
})
export class PlayerModule { }
