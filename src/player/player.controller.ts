import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';
import { Player } from './player.entity';

@Controller('player')
export class PlayerController {

    constructor(
        private readonly playerService: PlayerService,
    ) { }
    @Post()
    async registerPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<CreatePlayerResponseDto> {
        return await this.playerService.createPlayer(createPlayerDto);
    }

    @Get(':username')
    async getPlayerByUsername(@Param('username') username: string): Promise<Player> {
        return await this.playerService.getPlayerWithUsername(username);
    }

    @Get(':playerAddress')
    async getPlayerByPlayerAddress(@Param('playerAddress') playerAddress: string): Promise<Player> {
        return await this.playerService.getPlayerWithPlayerAddress(playerAddress);
    }
}
