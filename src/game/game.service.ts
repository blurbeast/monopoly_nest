import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus, Position } from './game.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { plainToInstance } from 'class-transformer';
import { PlayerService } from '../player/player.service';
import axios from 'axios';

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

    console.log(foundPlayer);

    if (foundPlayer.currentGameId !== null) {
      throw new Error('player already in a game');
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
    const roomId: string = await this.assignRoomId();

    const game = plainToInstance(Game, {
      gameRoomId: roomId,
      bankContractAddress: bankAddress,
    });
    foundPlayer.currentGameId = roomId;
    const mappedObj = new Map([[foundPlayer.playerAddress, true]]);
    game.playerToAddress = Object.fromEntries(mappedObj);

    const playersPosition: Position[] = [];
    game.numberOfPlayers = numberOfPlayer;
    game.playerPositions = playersPosition;

    await this.playerService.updatePlayer(foundPlayer);
    const savedGame = await this.gameRepository.save(game);

    return savedGame.gameRoomId;
  };

  joinGame = async (
    gameRoomId: string,
    userAddress: string,
  ): Promise<string> => {
    // check if the gameId is valid
    const game = await this.getGame(gameRoomId);

    // find player too
    const player =
      await this.playerService.getPlayerWithPlayerAddress(userAddress);

    if (game.hasStarted) {
      throw new Error('cannot join already started game');
    }

    const newlyMapped = new Map(Object.entries(game.playerToAddress));
    // now we check the number of players in the addresses to the number of registered players
    if (newlyMapped.size === game.numberOfPlayers) {
      throw new Error('game room already full');
    }

    // now we need to check if a player has already joined before now
    if (newlyMapped.get(player.playerAddress)) {
      throw new Error('player already in this game');
    }

    newlyMapped.set(player.playerAddress, true);

    game.playerToAddress = Object.fromEntries(newlyMapped);
    // update the player has joined the game via calling the player service
    player.currentGameId = game.gameRoomId;
    await this.playerService.updatePlayer(player);
    await this.gameRepository.update(game.id, game);

    return 'successfully joined';
  };

  getGame = async (gameRoomId: string): Promise<Game> => {
    const game = await this.gameRepository.findOne({
      where: { gameRoomId },
    });

    if (!game) {
      throw new Error('invalid game room id provided ');
    }
    return game;
  };

  startGame = async (gameRoomId: string): Promise<string> => {
    // find the game
    // const game = await this.gameRepository.findOne({ where: { gameRoomId } });

    //
    // // check if the game has started and is on PENDING
    // if (game.hasStarted && game.status !== GameStatus.PENDING) {
    //   throw new Error('game already started');
    // }
    // // confirm that more than  player has joined the game or better still confirm with number of players specified with number of joined player
    // if (game.players.length < 2 && game.players.length < game.numberOfPlayers) {
    //   throw new Error('not all players has joined game');
    // }
    //
    // // call on the bank contract here to add players and also give them tokens to their smart account
    // // get all players smart account
    // const playersSmartAccount: string[] = game.playersAddresses.map(
    //   (p) => p,
    // );
    //
    // // now call the blockchain service to call on the game contract address so that players address has the token
    // await this.blockchainService.mintToPlayers(
    //   game.bankContractAddress,
    //   playersSmartAccount,
    // );
    //
    // game.hasStarted = true;
    // game.status = GameStatus.ACTIVE;
    // game.currentTurn = game.playersAddresses[0];
    //
    // // update the game
    // await this.gameRepository.update(game.id, game);

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

    // const playerIndex = game.players.findIndex(
    //   (p) => p.playerAddress === game.currentTurn,
    // );
    // const nextIndex = (playerIndex + 1) % game.players.length;
    // game.currentTurn = game.players[nextIndex].playerAddress;
    //
    // await this.gameRepository.update(game.id, game);

    // return `next player :: ${game.playersAddresses[nextIndex].username}`;
    return '';
  };

  private async assignRoomId(): Promise<string> {
    let roomId: string = await this.generateRoomId();
    while (
      await this.gameRepository.findOne({
        where: {
          gameRoomId: roomId,
        },
      })
    ) {
      roomId = await this.generateRoomId();
    }
    return roomId;
  }

  private async generateRoomId(): Promise<string> {
    const response = await axios.get(
      'https://www.random.org/strings/?num=1&len=5&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new',
    );

    const result = JSON.stringify(response.data).slice(1, 6).trim();

    console.log('generated randomness ::: ', result);

    return result;
  }
}
