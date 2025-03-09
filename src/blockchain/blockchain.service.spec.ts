import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should deploy a smart account', async () => {
    const smartAccountAddress = await service.deploySmartAccount('0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab28');

    expect(smartAccountAddress.startsWith('0x')).toBe(true);
  });


});
