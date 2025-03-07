import { Module } from '@nestjs/common';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GameService],
})
export class GameModule {}
