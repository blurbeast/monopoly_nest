import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';
import * as dotenv from 'dotenv';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ViemService } from '../viemM/viem.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EthersMService } from '../ethers-m/ethers-m.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Salted } from './salted.entity';
import { Repository } from 'typeorm';
dotenv.config();

describe('PlayerService', () => {
  let service: PlayerService;
  let playerRepo: Repository<Player>;
  let saltedRepo: Repository<Salted>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // ConfigModule.forRoot({ envFilePath: '.env' }),
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
              entities: [Player, Salted],
              synchronize: true,
            };
          },
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Player, Salted]),
      ],
      providers: [
        PlayerService,
        BlockchainService,
        ViemService,
        ConfigService,
        EthersMService,
      ],
    }).compile();
    service = module.get<PlayerService>(PlayerService);
    playerRepo = module.get(getRepositoryToken(Player));
    saltedRepo = module.get(getRepositoryToken(Salted));
  });

  afterEach(async () => {
    // Clean up the module to avoid state persistence
    await playerRepo.query('ROLLBACK');
    await saltedRepo.query('ROLLBACK');
    const module = await Test.createTestingModule({}).compile();
    await module.close();
  });

  it('player should be registered, smart account address should be assigned', async () => {
    const createPlayerDto = new CreatePlayerDto();
    createPlayerDto.username = 'test171';
    createPlayerDto.playerAddress =
      '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab66';

    const createPlayerResponse = await service.createPlayer(createPlayerDto);

    expect(createPlayerResponse).not.toBeNull();
    expect(createPlayerResponse.username).toBe(createPlayerDto.username);
    expect(createPlayerResponse.playerAddress).toBe(
      createPlayerDto.playerAddress,
    );
    expect(createPlayerResponse.smartAccountAddress).not.toBeNull();
    expect(createPlayerResponse.smartAccountAddress.startsWith('0x')).toBe(
      true,
    );
    expect(createPlayerResponse.smartAccountAddress.length).toBe(42);
  }, 30_000);
});
