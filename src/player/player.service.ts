import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { plainToInstance } from 'class-transformer';

// import { plainToInstance } from 'class-transformer';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly blockchainService: BlockchainService,
  ) {}

  // inform the front end to always send a lower case of the username
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

      if (foundPlayer !== null) {
        throw new Error(`Player ${createPlayerDto.username} already exist`);
      }
      // always convert username to lowercase
      createPlayerDto.username.toLowerCase();

      // now we need to look for a way to generate number in terms of salt for each user
      const userSalt = await this.playerRepository.count();

      // crete a smart account for  the new user
      // call the blockchain service to do that.
      // since we are using one single key for each user , we are using salt to differentiate each user

      // since we are not deleting any player , then it is safe to use the number of players
      const newUserAddress = await this.blockchainService.createSmartAccount(
        // salt
        userSalt + 10,
      );

      const player = plainToInstance(Player, createPlayerDto);

      // assign the smart account address to a user
      player.smartAccountAddress = newUserAddress;

      // save the player
      const savedPlayer = await this.playerRepository.save(player);

      return plainToInstance(CreatePlayerResponseDto, savedPlayer, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // expose the api for this
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

  // expose the api for this
  async getPlayerWithPlayerAddress(playerAddress: string): Promise<Player> {
    return this.getPlayer('playerAddress', playerAddress);
  }
}
