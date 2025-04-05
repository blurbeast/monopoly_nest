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
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab12';
    const roomId = await service.createGame(playerAddress, 7);

    expect(roomId).toBeDefined();
    // expect(roomId).toBeInstanceOf(String);
    expect(roomId.length).toBe(5);

    const foundGame = await service.getGame(roomId);
    expect(foundGame?.numberOfPlayers).toBe(7);

    // expect(foundGame?.playersAddresses[0] === playerAddress).toBe(true);

    expect(service).toBeDefined();

    const foundPlayer =
      await playerService.getPlayerWithPlayerAddress(playerAddress);

    expect(foundPlayer.currentGameId).toBe(foundGame?.gameRoomId);
  });

  it('a player in an existing game room cannot create a new game', async () => {
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab18';

    await expect(service.createGame(playerAddress, 5)).rejects.toThrow(
      'player already in a game',
    );
  });

  it('player should be able to join game', async () => {
    const roomId: string = 'B6ICx';
    const playerAddress: string = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab18';
    const response = await service.joinGame(roomId, playerAddress);

    expect(response).toBeDefined();
    expect(response).toBe('successfully joined');

    const foundGame: Game | null = await service.getGame(roomId);
    if (foundGame) {
      expect(foundGame).toBeDefined();
      expect(foundGame?.numberOfPlayers).toBeGreaterThan(0);
      // expect(foundGame.numberOfPlayers).toBeLessThan(7);
      expect(foundGame.status).toBe(GameStatus.PENDING);

      expect(foundGame.hasStarted).toBeFalsy();

      const foundPlayer: Player =
        await playerService.getPlayerWithPlayerAddress(playerAddress);

      expect(foundPlayer.currentGameId).toBe(foundGame?.gameRoomId);
      // foundGame?.players.some((p) =>
      //   expect(p.currentGameId === roomId).toBe(true),
      // );
    }
  });
});
