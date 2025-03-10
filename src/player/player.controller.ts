import { Body, Controller, Post } from '@nestjs/common';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {

    constructor(
        private readonly playerService: PlayerService,
    ) { }

    @Post()
    async registerPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<CreatePlayerResponseDto> {
        return await this.playerService.createPlayer(createPlayerDto);
    }
}
