import { Injectable } from '@nestjs/common';
import { ViemService } from '../viemM/viem.service';
import { encodeFunctionData, parseAbi } from 'viem';
import { ConfigService } from '@nestjs/config';
import { EthersMService } from '../ethers-m/ethers-m.service';

@Injectable()
export class BlockchainService {
  // private playerContract: ethers.Contract;
  // private entryPointContract: ethers.Contract;
  // private readonly defaultWallet: ethers.Wallet;
  // private readonly provider: ethers.JsonRpcProvider;
  // private entryPointContractAddress: string;
  private readonly nftContractAddress: any;
  private readonly gameToken: any;

  constructor(
    private readonly viemService: ViemService,
    private readonly configService: ConfigService,
    private readonly ethersService: EthersMService,
  ) {
    if (!configService.get<string>('NFT_CONTRACT_ADDRESS')) {
      throw new Error(
        'could not read environment variables: NFT_CONTRACT_ADDRESS',
      );
    }
    if (!configService.get('GAME_TOKEN')) {
      throw new Error('could not read environment variables: GAME_TOKEN');
    }

    this.nftContractAddress = configService.get<string>('NFT_CONTRACT_ADDRESS');
    this.gameToken = configService.get<string>('GAME_TOKEN');
  }

  async createSmartAccount(userId: number) {
    const newSmartAccount = await this.viemService.account(userId);
    const userAddress: string = newSmartAccount.address;

    return userAddress;
  }

  deployBankContract = async (numberOfPlayers: number): Promise<string> => {
    // using libraries like ethers or viem to deploy the contract
    // for this project we are relying on view at the moment
    // in the future we might as well use other libraries , hence, the block chain module is on it own while the libraries module are separate as well

    // the bank contract takes the number of players and the nftContract address
    return await this.ethersService.deployGameBank(
      numberOfPlayers,
      this.nftContractAddress as string,
      this.gameToken as string,
    );
  };

  interactOnChain = async (target: string) => {
    const encodedData = encodeFunctionData({
      abi: parseAbi([
        'function setCount(uint256 _value) external returns (uint256)',
      ]),
      functionName: 'setCount',
      args: [BigInt(30100)],
    });

    const response = await this.viemService.sendUserOperation(
      3,
      target,
      0,
      encodedData,
    );

    console.log('responses ::: ', response);
    return response;
  };

  async mintToPlayers(
    bankContractAddress: string,
    playersSmartAccount: string[],
  ) {
    const bankContract =
      this.viemService.getAContractInstance(bankContractAddress);
    // write to the contract
    await bankContract.write.mintTo(playersSmartAccount, 1500);
  }
}
