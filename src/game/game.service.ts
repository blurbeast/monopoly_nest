import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    private readonly blockchainService: BlockchainService,
  ) { }

  async createGame(): Promise<String> {

    // deploy game bank onchain 
    const bankAddress: string = "";


    // create game room;
    const roomId: string = this.assignRoomId();

    const game = plainToInstance(Game, {
      gameRoomId: roomId,
      bankContractAddress: bankAddress
    });

    const savedGame = this.gameRepository.create(game);

    return savedGame.gameRoomId;
  }

  private assignRoomId(): string {
    let roomId: string = this.generateRoomId();
    while (this.gameRepository.findOne({ where: { 'gameRoomId': roomId } })) {
      roomId = this.generateRoomId();
    }
    return roomId;
  }

  private generateRoomId(): string {
    const ids: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomId: string = "";
    for (let i = 0; i < 5; i++) {
      roomId += ids.charAt(Math.floor(Math.random() * ids.length));
    }
    return roomId;
  }
}
