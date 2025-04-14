import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';
import { PlayerResponse } from './dtos/PlayerResponse';
import { AllExceptionsFilter } from '../all_exception';

@Controller('player')
@UseFilters(AllExceptionsFilter)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}
  @Post()
  async registerPlayer(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<CreatePlayerResponseDto> {
    return await this.playerService.createPlayer(createPlayerDto);
  }

  @Get('username/:username')
  async getPlayerByUsername(
    @Param('username') username: string,
  ): Promise<PlayerResponse> {
    return await this.playerService.getPlayerWithUsername(username);
  }

  @Get('address/:playerAddress')
  async getPlayerByPlayerAddress(
    @Param('playerAddress') playerAddress: string,
  ): Promise<PlayerResponse> {
    return await this.playerService.getPlayerWithPlayerAddress(playerAddress);
  }
}
