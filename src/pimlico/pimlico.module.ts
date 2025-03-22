import { Module } from '@nestjs/common';
import { PimlicoService } from './pimlico.service';

@Module({
  providers: [PimlicoService],
  exports: [PimlicoService],
})
export class PimlicoModule {}
