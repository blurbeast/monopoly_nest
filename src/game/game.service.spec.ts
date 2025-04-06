import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Game, GameStatus } from './game.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ViemService } from '../viemM/viem.service';
import { EthersMService } from '../ethers-m/ethers-m.service';
import { Player } from '../player/player.entity';
import { Salted } from '../player/salted.entity';

describe('GameService', () => {
  let service: GameService;
  let playerService: PlayerService;
  jest.setTimeout(40_000);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            return {
              type: 'postgres' as const,
              host: configService.get<string>('DB_HOST'),
              port: configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
              entities: [Game, Player, Salted],
              synchronize: true,
            };
          },
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Game, Player, Salted]),
      ],
      providers: [
        GameService,
        BlockchainService,
        ViemService,
        ConfigService,
        EthersMService,
        PlayerService,
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it('player should be able to create game', async () => {
    // player already exist
    // now create a game
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab26';
    const roomId = await service.createGame(playerAddress, 2);

    expect(roomId).toBeDefined();
    // expect(roomId).toBeInstanceOf(String);
    expect(roomId.length).toBe(5);

    const foundGame = await service.getGame(roomId);
    expect(foundGame?.numberOfPlayers).toBe(2);

    expect(service).toBeDefined();

    const foundPlayer =
      await playerService.getPlayerWithPlayerAddress(playerAddress);

    expect(foundPlayer.currentGameId).toBe(foundGame?.gameRoomId);
  });

  it('a player in an existing game room cannot create a new game', async () => {
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab26';

    await expect(service.createGame(playerAddress, 5)).rejects.toThrow(
      'player already in a game',
    );
  });

  it('player should be able to join game', async () => {
    const roomId: string = '0U1yn';
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab46';
    const response = await service.joinGame(roomId, playerAddress);

    expect(response).toBeDefined();
    expect(response).toBe('successfully joined');

    const foundGame: Game = await service.getGame(roomId);
    expect(foundGame).toBeDefined();
    expect(foundGame?.numberOfPlayers).toBeGreaterThan(0);
    expect(foundGame.numberOfPlayers).toBe(2);
    expect(foundGame.status).toBe(GameStatus.PENDING);
    expect(foundGame.hasStarted).toBeFalsy();

    const foundPlayer: Player =
      await playerService.getPlayerWithPlayerAddress(playerAddress);

    expect(foundPlayer.currentGameId).toBe(foundGame?.gameRoomId);
    // foundGame?.players.some((p) =>
    //   expect(p.currentGameId === roomId).toBe(true),
    // );
  });

  it('should throw an error when an invalid game room id is provided ', async () => {
    const gameId: string = '';
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab15';

    await expect(service.joinGame(gameId, playerAddress)).rejects.toThrow(
      'invalid game room id provided',
    );
  });

  it("player shouldn't be able to join a game more than once ", async () => {
    const gameId: string = 'u22Wy';
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab36';

    await expect(service.joinGame(gameId, playerAddress)).rejects.toThrow(
      'player already in this game',
    );

    const secondPlayer: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab26';

    await expect(service.joinGame(gameId, secondPlayer)).rejects.toThrow(
      'player already in this game',
    );
  });

  it('game cannot allow more than the number of said players', async () => {
    const gameId: string = 'u22Wy';
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab66';

    await expect(service.joinGame(gameId, playerAddress)).rejects.toThrow(
      'game room already full',
    );
  });

  it('created game can be started ', async () => {
    const gameId: string = '0U1yn';
    const response = await service.startGame(gameId);

    expect(response).toBeDefined();
    expect(response).toBe('game started');

    const foundGame: Game = await service.getGame(gameId);
    expect(foundGame?.numberOfPlayers).toBe(2);
    expect(foundGame.hasStarted).toBeTruthy();
    expect(foundGame.status).toBe(GameStatus.ACTIVE);
  });
});
