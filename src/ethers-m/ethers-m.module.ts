import { Module } from '@nestjs/common';
import { EthersMService } from './ethers-m.service';

@Module({
  providers: [EthersMService],
  exports: [EthersMService],
})
export class EthersMModule {}
