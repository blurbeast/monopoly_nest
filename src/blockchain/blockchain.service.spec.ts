import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { ViemService } from '../viemM/viem.service';
import { ConfigService } from '@nestjs/config';

describe('BlockchainService', () => {
  let service: BlockchainService;

  jest.setTimeout(6_000); // set to expect each test result to come back in 6 secs

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService, ViemService, ConfigService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should create a smart account', async () => {
    const smartAddress = await service.createSmartAccount(5);
    console.log('smart account address', smartAddress);
    expect(smartAddress).toBeDefined();
    // expect(smartAddress).toBeInstanceOf(typeof String);
    expect(smartAddress.length).toBe(42);
    expect(smartAddress.startsWith('0x')).toBe(true);
  }, 10_000);

  it('using already used salt returns the same account assigned to the salt', async () => {
    const smartAccount = await service.createSmartAccount(5);
    expect(smartAccount).toBeDefined();
    // ends with "fa30" because the salt has been used to register for another user
    expect(smartAccount.endsWith('fa30')).toBe(true);
  });

  it('using another salt to create account and return entirely another account address ', async () => {
    // using another salt
    const smartAccount = await service.createSmartAccount(6);
    expect(smartAccount).toBeDefined();
    expect(smartAccount).not.toEqual(
      '0xa41c572E2D4Edddd220576e26de15f990ddefa30',
    );
  });

  it('deploy bank contract', async () => {
    // call the deploy contract function
    const address = await service.deployBankContract(7);
    console.log('deploy bank contract address', address);
    expect(address).toBeDefined();
    expect(address.length).toBe(42);
    expect(address.startsWith('0x')).toBe(true);
  }, 10_000);
});
