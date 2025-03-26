import { Module } from '@nestjs/common';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), BlockchainModule, PlayerModule],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
