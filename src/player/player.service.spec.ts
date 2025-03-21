import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import * as dotenv from 'dotenv';
import { PlayerModule } from './player.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';
dotenv.config();

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // Configure TypeORM with an in-memory database for testing
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   database: process.env.monopoly,
        //   entities: [Player],
        //   synchronize: true, // Auto-create tables for testing
        // }),
        // TypeOrmModule.forFeature([Player]), // Provide the Player repository
        BlockchainModule,
        PlayerModule // Import the real BlockchainModule
      ],
      providers: [PlayerService, BlockchainService],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  afterEach(async () => {
    // Clean up the module to avoid state persistence
    const module = await Test.createTestingModule({}).compile();
    await module.close();
  });

  it('player should be registered, smart account address should be assigned', async () => {
    const createPlayerDto = new CreatePlayerDto();
    createPlayerDto.username = 'test';
    createPlayerDto.playerAddress = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab28';

    const createPlayerResponse = await service.createPlayer(createPlayerDto);

    expect(createPlayerResponse).not.toBeNull();
    expect(createPlayerResponse.username).toBe(createPlayerDto.username);
    expect(createPlayerResponse.playerAddress).toBe(createPlayerDto.playerAddress);
    expect(createPlayerResponse.smartAccountAddress).not.toBeNull();
    expect(createPlayerResponse.smartAccountAddress.startsWith('0x')).toBe(true);
    expect(createPlayerResponse.smartAccountAddress.length).toBe(42);
  });
});