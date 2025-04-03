import { Module } from '@nestjs/common';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { PlayerModule } from 'src/player/player.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    BlockchainModule,
    PlayerModule,
    HttpModule,
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
