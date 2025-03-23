import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get(':target')
  async onChain(@Param('target') target: string): Promise<any> {
    return await this.blockchainService.interactOnChain(target);
  }
}
