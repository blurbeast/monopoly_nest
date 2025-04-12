import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as BankContract from '../blockchain/abis/BankContract.json';

@Injectable()
export class EthersMService {
  constructor(private readonly configService: ConfigService) {}

  deployGameBank = async (
    numberOfPlayers: number,
    nftContractAddress: string,
    gameToken: string,
  ): Promise<string> => {
    // get the environment variables
    const providerUrl = this.configService.get<string>('PROVIDER_URL');
    // // get the pk
    const pk = this.configService.get<string>('WALLET_KEY');

    // connect to ethers
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(pk as string, provider);

    // get the contract instance tp deploy
    const factory = new ethers.ContractFactory(
      BankContract.abi,
      BankContract.bytecode.object,
      wallet,
    );

    const f = await factory.deploy(
      numberOfPlayers,
      nftContractAddress,
      gameToken,
    );

    await f.waitForDeployment();

    return f.target as string;
  };

  getBankContractInstance = (contractAddress: string) => {
    const providerUrl = this.configService.get<string>('PROVIDER_URL');
    // // get the pk
    const pk = this.configService.get<string>('WALLET_KEY');
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const wallet = new ethers.Wallet(pk as string, provider);
    return new ethers.Contract(contractAddress, BankContract.abi, wallet);
  };
}
