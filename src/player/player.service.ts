import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
// import { plainToInstance } from 'class-transformer';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createPlayer(
    createPlayerDto: CreatePlayerDto,
  ): Promise<CreatePlayerResponseDto> {
    try {
      const foundPlayer = await this.playerRepository.findOne({
        where: [
          { username: createPlayerDto.username.toLowerCase() },
          { playerAddress: createPlayerDto.playerAddress },
        ],
      });

      if (foundPlayer !== null)
        throw new Error(`Player ${createPlayerDto.username} already exist`);

      return new CreatePlayerResponseDto();
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async getPlayerWithUsername(username: string): Promise<Player> {
    return this.getPlayer('username', username);
  }

  private async getPlayer(action: string, value: string): Promise<Player> {
    let player: Player | null;
    if (action === 'username') {
      player = await this.playerRepository.findOne({
        where: { username: value },
      });
    } else if (action === 'playerAddress') {
      player = await this.playerRepository.findOne({
        where: { playerAddress: value },
      });
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
    if (!player) throw new Error(`Player with ${action} ${value} not found`);
    return player;
  }

  async getPlayerWithPlayerAddress(playerAddress: string): Promise<Player> {
    return this.getPlayer('playerAddress', playerAddress);
  }
}
