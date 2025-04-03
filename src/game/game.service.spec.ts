import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Game } from './game.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ViemService } from '../viemM/viem.service';
import { EthersMService } from '../ethers-m/ethers-m.service';
import { Player } from '../player/player.entity';
import { Salted } from '../player/salted.entity';

describe('GameService', () => {
  let service: GameService;
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
  });

  it('player should be able to create game', async () => {
    // player already exist
    // now create a game
    const roomId = await service.createGame(
      '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab18',
      7,
    );

    expect(roomId).toBeDefined();
    // expect(roomId).toBeInstanceOf(String);
    expect(roomId.length).toBe(5);

    expect(service).toBeDefined();
  });
});
