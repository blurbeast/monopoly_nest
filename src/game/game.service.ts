import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from './game.entity';
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
    // ensure the number of players does not exceed 9
    if (numberOfPlayer > 9) {
      throw new Error('number of players cannot exceed 9');
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
    game.numberOfPlayers = numberOfPlayer;

    const savedGame = await this.gameRepository.save(game);

    return savedGame.gameRoomId;
  };

  joinGame = async (
    gameRoomId: string,
    userAddress: string,
  ): Promise<string> => {
    // check if the gameId is valid
    const game = await this.gameRepository.findOne({ where: { gameRoomId } });
    if (!game ) {
      throw new Error('invalid game id provided');
    }

    // find player too
    const player =
      await this.playerService.getPlayerWithPlayerAddress(userAddress);

    if (!player) {
      throw new Error('could not locate player with the specified address');
    }

    if (game.hasStarted) {
      throw new Error('cannot join already started game');
    }

    if (
      game.players.length === 9 ||
      game.players.length === game.numberOfPlayers
    ) {
      throw new Error('game already full');
    }

    // check if the game has not joined before
    if (game.players.some((p) => p.playerAddress === player.playerAddress)) {
      throw new Error('player already in the game room');
    }

    game.players.push(player);

    // update it back in the repo

    await this.gameRepository.update(game.id, game);

    return 'successfully joined';
  };

  startGame = async (gameRoomId: string): Promise<string> => {
    // find the game
    const game = await this.gameRepository.findOne({ where: { gameRoomId } });
    if (!game) {
      throw new Error('invalid game id provided');
    }

    // check if the game has started and is on PENDING
    if (game.hasStarted && game.status !== GameStatus.PENDING) {
      throw new Error('game already started');
    }
    // confirm that more than  player has joined the game or better still confirm with number of players specified with number of joined player
    if (game.players.length < 2 && game.players.length < game.numberOfPlayers) {
      throw new Error('not all players has joined game');
    }

    // call on the bank contract here to add players and also give them tokens to their smart account
    // get all players smart account
    const playersSmartAccount: string[] = game.players.map(
      (p) => p.smartAccountAddress,
    );

    // now call the blockchain service to call on the game contract address so that players address has the token
    await this.blockchainService.mintToPlayers(
      game.bankContractAddress,
      playersSmartAccount,
    );

    game.hasStarted = true;
    game.status = GameStatus.ACTIVE;
    game.currentTurn = game.players[0].playerAddress;

    // update the game
    await this.gameRepository.update(game.id, game);

    return 'game started';
  };

  nextTurn = async (gameRoomId: string): Promise<string> => {
    const game = await this.gameRepository.findOne({ where: { gameRoomId } });
    if (!game) {
      throw new Error('invalid game id provided');
    }
    if (!game.hasStarted || game.status !== GameStatus.ACTIVE) {
      throw new Error('game is not active');
    }

    const playerIndex = game.players.findIndex(
      (p) => p.playerAddress === game.currentTurn,
    );
    const nextIndex = (playerIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextIndex].playerAddress;

    await this.gameRepository.update(game.id, game);

    return `next player :: ${game.players[nextIndex].username}`;
  };

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
