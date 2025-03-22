import { Test, TestingModule } from '@nestjs/testing';
import { PimlicoService } from './pimlico.service';

describe('PimlicoService', () => {
  let service: PimlicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PimlicoService],
    }).compile();

    service = module.get<PimlicoService>(PimlicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
