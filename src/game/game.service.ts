import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { plainToInstance } from 'class-transformer';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    private readonly blockchainService: BlockchainService,
    private readonly playerService: PlayerService,
  ) {}

  createGame = async (
    userAddress: string,
    numberOfPlayer: number,
  ): Promise<string> => {
    // find the player
    const foundPlayer =
      await this.playerService.getPlayerWithPlayerAddress(userAddress);

    if (foundPlayer === null) {
      throw new Error('could not find player');
    }
    // deploy game bank on chain
    //to get the bank address deploy on chain , we need to call on the blockchain service
    const bankAddress: string =
      await this.blockchainService.deployBankContract(numberOfPlayer);

    // create game room;
    const roomId: string = this.assignRoomId();

    const game = plainToInstance(Game, {
      gameRoomId: roomId,
      bankContractAddress: bankAddress,
    });
    game.players.push(foundPlayer);

    const savedGame = await this.gameRepository.save(game);

    return savedGame.gameRoomId;
  };

  joinGame = async (
    gameRoomId: string,
    userAddress: string,
  ): Promise<string> => {
    // check if the gameId is valid
    const game = await this.gameRepository.findOne({ where: { gameRoomId } });
    if (game === null) {
      throw new Error('invalid game id provided');
    }

    // find player too
    const player =
      await this.playerService.getPlayerWithPlayerAddress(userAddress);

    if (player === null) {
      throw new Error('could not locate player with the specified address');
    }

    game.players.push(player);

    // update it back in the repo

    await this.gameRepository.update(game.id, game);

    return 'successfully joined';
  };

  startGame = async () => {};

  private assignRoomId(): string {
    let roomId: string = this.generateRoomId();
    while (
      this.gameRepository.findOne({
        where: {
          gameRoomId: roomId,
        },
      }) !== null
    ) {
      roomId = this.generateRoomId();
    }
    return roomId;
  }

  private generateRoomId(): string {
    const ids: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId: string = '';
    for (let i = 0; i < 5; i++) {
      roomId += ids.charAt(Math.floor(Math.random() * ids.length));
    }
    return roomId;
  }
}
