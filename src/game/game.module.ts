import { Module } from '@nestjs/common';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Game])],
    providers: [GameService],
    controllers: [GameController],
    exports: [GameService]
})
export class GameModule { }
