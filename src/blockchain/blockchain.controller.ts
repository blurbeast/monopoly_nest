import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
// import { Hex } from 'viem';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('properties/:bankContract')
  async getProperties(@Param('bankContract') bankContract: string) {
    return await this.blockchainService.getBankProperties(bankContract);
  }

  // @Get('deploy')
  // async deployBankContract() {
  //   return await this.blockchainService.deployBankContract(5);
  // }
}
