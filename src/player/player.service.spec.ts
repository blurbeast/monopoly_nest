import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerService],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('player should be registered , smart account address should be assigned', async () => {
    const createPlayerDto = new CreatePlayerDto();
    createPlayerDto.username = 'test';
    createPlayerDto.playerAddress = '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab28';


    const createPlayerResponse = await service.createPlayer(createPlayerDto);
  });
});
