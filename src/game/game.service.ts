import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus, Position } from './game.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { plainToInstance } from 'class-transformer';
import { PlayerService } from '../player/player.service';
import axios from 'axios';
import { Player } from '../player/player.entity';
import { encodeFunctionData, getAddress, parseAbi } from 'viem';
import { ConfigService } from '@nestjs/config';
import { GameResponse } from './dto/GameResponse';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    private readonly blockchainService: BlockchainService,
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
  ) {}

  createGame = async (
    userAddress: string,
    numberOfPlayer: number,
  ): Promise<string> => {
    // find the player
    const foundPlayer = await this.playerService.getPlayer(
      'playerAddress',
      userAddress,
    );

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
    const mappedObj = new Map([
      [
        foundPlayer.playerAddress,
        { smartAccountAddress: foundPlayer.smartAccountAddress, joined: true },
      ],
    ]);
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
    const player = await this.playerService.getPlayer(
      'playerAddress',
      userAddress,
    );

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

    newlyMapped.set(player.playerAddress, {
      smartAccountAddress: player.smartAccountAddress,
      joined: true,
    });

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
    const game: Game = await this.getGame(gameRoomId);

    // check if the game has started and is on PENDING
    if (game.hasStarted && game.status !== GameStatus.PENDING) {
      throw new Error('game already started');
    }
    // confirm that more than  player has joined the game or better still confirm with number of players specified with number of joined player
    //get the size of the joined players
    const allPlayers = new Map(Object.entries(game.playerToAddress));

    if (allPlayers.size < game.numberOfPlayers) {
      throw new Error('could not start game , not all players have joined ');
    }

    // call the player service
    const playersAddresses = Array.from(allPlayers.values());
    console.log('players addresses ::: ', playersAddresses);

    const smartAddresses: string[] = [];

    playersAddresses.forEach((playerAddress) => {
      smartAddresses.push(playerAddress.smartAccountAddress);
    });

    console.log('smart addresses are ::: ', smartAddresses);

    await this.blockchainService.mintToPlayers(
      game.bankContractAddress,
      smartAddresses,
    );

    game.hasStarted = true;
    game.status = GameStatus.ACTIVE;
    game.currentTurn = Array.from(allPlayers.keys())[0];

    // update the game
    await this.gameRepository.save(game);

    return 'game started';
  };

  // getAllBankProperties = async (gameRoomId: string) => {
  //   const game: Game = await this.getGame(gameRoomId);
  //   const bankProperties = await this.blockchainService.getBankProperties(
  //     game.bankContractAddress,
  //   );
  //   return bankProperties;
  // };
  nextTurn = async (gameRoomId: string): Promise<string> => {
    const game = await this.getGame(gameRoomId);

    if (!game.hasStarted || game.status !== GameStatus.ACTIVE) {
      throw new Error('game is not active');
    }

    const allPlayers = new Map(Object.entries(game.playerToAddress));
    const allPlayersArray = Array.from(allPlayers.keys());

    const playerIndex: number = allPlayersArray.findIndex(
      (p) => p === game.currentTurn,
    );

    const nextIndex = (playerIndex + 1) % allPlayersArray.length;
    game.currentTurn = allPlayersArray[nextIndex];

    await this.gameRepository.save(game);

    // return `next player :: ${game.playersAddresses[nextIndex].username}`;
    return `next player is ${game.currentTurn}`;
  };

  payRent = async (
    gamedId: string,
    propertyId: string,
    diceRolled: number,
    playerAddress: string,
  ) => {
    // get game
    const game: Game = await this.getGame(gamedId);
    if (!game.hasStarted && game.status === GameStatus.PENDING) {
      throw new Error('game is not active');
    }

    if (game.currentTurn !== playerAddress) {
      throw new Error('not your turn');
    }
    // check if player has grant the bank contract to perform action on it behalf

    // call on the blockchain service to perform action
  };

  // playGame = async (gameRoomId: string) => {
  //   const game: Game = await this.getGame(gameRoomId);
  // };

  getGameBankProperties = async (gameRoomId: string) => {
    const game: Game = await this.getGame(gameRoomId);

    return await this.blockchainService.getBankProperties(
      game.bankContractAddress,
    );
  };

  // approve game bank contract
  approveGameBankAddress = async (gameId: string, playerAddress: string) => {
    const game = await this.getGame(gameId);
    if (!game.hasStarted && game.status === GameStatus.PENDING) {
      throw new Error('game is not active');
    }

    const player: Player = await this.playerService.getPlayer(
      'playerAddress',
      playerAddress,
    );

    // call on the blockchain service to perform action via AA

    // first encode the action
    const encodedData = encodeFunctionData({
      abi: parseAbi([
        'function approve(address gameId, address owner, address spender) external',
      ]),
      functionName: 'approve',
      args: [
        getAddress(game.bankContractAddress),
        getAddress(player.smartAccountAddress),
        getAddress(game.bankContractAddress),
      ],
    });

    // call on the blockchain interactOnChain function to perform action
    const gameTokenAddress = this.configService.get<string>('GAME_TOKEN');
    if (!gameTokenAddress) {
      throw new Error('invalid game token');
    }
    await this.blockchainService.interactOnChain(
      gameTokenAddress,
      encodedData,
      player.userSalt,
    );
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

    return JSON.stringify(response.data).slice(1, 6).trim();
  }

  getGameResponse = async (gameId: string): Promise<GameResponse> => {
    const game: Game = await this.getGame(gameId);
    const response: GameResponse = plainToInstance(GameResponse, game, {
      excludeExtraneousValues: true,
    });
    console.log('game response', response);
    return response;
  };
}
