import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePlayerDto } from './dtos/CreatePlayer.dto';
import { CreatePlayerResponseDto } from './dtos/CreatePlayerResponse.dto';
import { plainToInstance } from 'class-transformer';
import { Salted } from './salted.entity';

// import { plainToInstance } from 'class-transformer';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Salted)
    private readonly saltedRepository: Repository<Salted>,
    private readonly blockchainService: BlockchainService,
  ) {}

  private createSalted = async () => {
    const salted = await this.saltedRepository.findOne({
      where: { id: 1 },
    });
    if (!salted) {
      const saltt = new Salted();
      await this.saltedRepository.save(saltt);
    }
  };

  private getSaltedValue = async () => {
    const salted = await this.saltedRepository.findOne({
      where: { id: 1 },
    });

    if (!salted) {
      await this.createSalted();
    }

    return salted ? salted.salt : 10;
  };

  private updateSalted = async (value: number) => {
    const salted = await this.saltedRepository.findOne({
      where: { id: 1 },
    });
    if (salted) {
      salted.salt = value;
      await this.saltedRepository.save(salted);
    }
  };

  // inform the front end to always send a lower case of the username
  async createPlayer(
    createPlayerDto: CreatePlayerDto,
  ): Promise<CreatePlayerResponseDto> {
    try {
      //checking if blockchain service exist
      console.log('block chain service :::', this.blockchainService);
      const salt = await this.getSaltedValue();

      const foundPlayer = await this.playerRepository.findOne({
        where: [
          { username: createPlayerDto.username.toLowerCase() },
          { playerAddress: createPlayerDto.playerAddress },
        ],
      });

      if (foundPlayer) {
        throw new Error(`Player ${createPlayerDto.username} already exist`);
      }
      // always convert username to lowercase
      createPlayerDto.username = createPlayerDto.username.toLowerCase();

      // now we need to look for a way to generate number in terms of salt for each user
      // const userSalt = await this.playerRepository.count({});

      // crete a smart account for  the new user
      // call the blockchain service to do that.
      // since we are using one single key for each user , we are using salt to differentiate each user
      const userId: number = salt + 1;
      // since we are not deleting any player , then it is safe to use the number of players
      const newUserAddress = await this.blockchainService.createSmartAccount(
        // salt
        userId,
      );

      const player = plainToInstance(Player, createPlayerDto);

      console.log('player', JSON.stringify(player));

      // assign the smart account address to a user
      player.smartAccountAddress = newUserAddress;
      player.userSalt = userId;

      // save the player
      const savedPlayer = await this.playerRepository.save(player);
      //
      console.log('saved player', JSON.stringify(savedPlayer));

      // save the new salt
      await this.updateSalted(userId);

      const result = this.createPlayerResponse(savedPlayer);

      console.log('result', JSON.stringify(result));

      return result;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  private createPlayerResponse = (player: Player): CreatePlayerResponseDto => {
    return plainToInstance(CreatePlayerResponseDto, {
      username: player.username,
      playerAddress: player.playerAddress,
      smartAccountAddress: player.smartAccountAddress,
    });
  };

  updatePlayer = async (player: Player) => {
    //get player
    const foundPlayer = await this.getPlayer('username', player.username);
    // update player with a spread operator and update the field to update
    await this.playerRepository.save({
      ...foundPlayer,
      currentGameId: player.currentGameId,
    });
  };

  // expose the api for this
  async getPlayerWithUsername(username: string): Promise<Player> {
    return this.getPlayer('username', username);
  }

  private async getPlayer(action: string, value: string): Promise<Player> {
    const player: Player | null =
      action === 'username'
        ? await this.playerRepository.findOne({
            where: { username: value },
          })
        : await this.playerRepository.findOne({
            where: { playerAddress: value },
          });

    if (!player) throw new Error(`Player with ${action} ${value} not found`);
    return player;
  }

  // expose the api for this
  async getPlayerWithPlayerAddress(playerAddress: string): Promise<Player> {
    return this.getPlayer('playerAddress', playerAddress);
  }
}
