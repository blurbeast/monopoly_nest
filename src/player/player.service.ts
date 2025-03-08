import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly blockchainService: BlockchainService,
  ) { }


  async createPlayer(): Promise<string> {
    try {

      return "";
    } catch (error) {
      throw new Error(error);
    }
  }
}
