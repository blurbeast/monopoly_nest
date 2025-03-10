import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { createPlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly blockchainService: BlockchainService,
  ) { }


  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<createPlayerResponseDto> {
    try {
      const foundPlayer = await this.playerRepository.findOne({
        where: [
          { username: createPlayerDto.username.toLowerCase() },
          { playerAddress: createPlayerDto.playerAddress },
        ]
      });

      if (foundPlayer !== null) throw new Error(`Player ${createPlayerDto.username} already exist`);

      // create a smart account for the user via the blockchain service
      let smartAccountAddress = await this.blockchainService.deploySmartAccount(createPlayerDto.playerAddress);

      // since we are using the create2Address there can be no duplicates 
      // let smartAccountAddressExist  = await this.playerRepository.existsBy({'smartAccountAddress': smartAccountAddress});

      const player = plainToInstance(Player, {
        ...createPlayerDto,
        smartAccountAddress
      });

      const savedPlayer = this.playerRepository.create(player);

      return plainToInstance(createPlayerResponseDto, savedPlayer, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      throw new Error(error as string);
    }
  }
}
