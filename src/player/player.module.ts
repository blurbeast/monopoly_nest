import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService],
})
export class PlayerModule {}
