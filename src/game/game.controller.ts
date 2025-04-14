import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('g/:gameRoomId')
  async getGame(@Param('gameRoomId') gameRoomId: string) {
    return this.gameService.getGame(gameRoomId);
  }

  @Post()
  async createGame(
    @Body() createGameParam: { userAddress: string; numberOfPlayers: number },
  ): Promise<string> {
    return this.gameService.createGame(
      createGameParam.userAddress,
      createGameParam.numberOfPlayers,
    );
  }

  @Patch()
  async joinGame(
    @Body() joinGameParam: { gameRoomId: string; userAddress: string },
  ) {
    return this.gameService.joinGame(
      joinGameParam.gameRoomId,
      joinGameParam.userAddress,
    );
  }

  @Get('r/:gameId')
  async getGameResponse(@Param('gameRoomId') gameRoomId: string) {
    return this.gameService.getGameResponse(gameRoomId);
  }
}
