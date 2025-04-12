import { Controller, Get } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
// import { Hex } from 'viem';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // @Get(':target')
  // async onChain(@Param('target') target: string): Promise<any> {
  //   return await this.blockchainService.interactOnChain(target, '' as Hex, '');
  // }

  @Get('properties')
  async getProperties() {
    return await this.blockchainService.getBankProperties(
      '0x272D75aC429D2C46a9fa71CEb9436F7d71E286e8',
    );
  }
}
