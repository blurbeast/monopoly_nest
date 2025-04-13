import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as BankContract from '../blockchain/abis/BankContract.json';

@Injectable()
export class EthersMService {
  private readonly chainProvider: ethers.JsonRpcProvider;
  private readonly polyWallet: ethers.Wallet;
  private contractFactory: ethers.ContractFactory;
  constructor(private readonly configService: ConfigService) {
    if (
      !this.configService.get<string>('PROVIDER_URL') &&
      this.configService.get<string>('WALLET_KEY')
    ) {
      throw new Error('Missing configuration environment');
    }

    this.chainProvider = new ethers.JsonRpcProvider(
      this.configService.get<string>('PROVIDER_URL'),
    );
    this.polyWallet = new ethers.Wallet(
      this.configService.get<string>('WALLET_KEY') as string,
      this.chainProvider,
    );

    this.contractFactory = new ethers.ContractFactory(
      BankContract.abi,
      BankContract.bytecode,
      this.polyWallet,
    );
  }

  deployGameBank = async (
    numberOfPlayers: number,
    nftContractAddress: string,
    gameToken: string,
  ): Promise<string> => {
    const f = await this.contractFactory.deploy(
      numberOfPlayers,
      nftContractAddress,
      gameToken,
    );

    await f.waitForDeployment();

    return f.target as string;
  };

  getBankContractInstance = (contractAddress: string) => {
    return new ethers.Contract(
      contractAddress,
      BankContract.abi,
      this.polyWallet,
    );
  };
}
