import { Module } from '@nestjs/common';
import { PimlicoService } from './pimlico.service';

@Module({
  providers: [PimlicoService]
})
export class PimlicoModule {}
