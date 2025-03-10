import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { createPlayerResponseDto } from './dtos/CreatePlayerResponse.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly blockchainService: BlockchainService,
  ) { }


  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<createPlayerResponseDto> {
    try {
      return new createPlayerResponseDto();
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
