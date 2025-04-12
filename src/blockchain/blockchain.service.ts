import { Injectable } from '@nestjs/common';
import { ViemService } from '../viemM/viem.service';
// import { encodeFunctionData, parseAbi } from 'viem';
import { ConfigService } from '@nestjs/config';
import { EthersMService } from '../ethers-m/ethers-m.service';
import {
  ByteArray,
  bytesToString,
  EncodeFunctionDataReturnType,
  Hex,
} from 'viem';
import {
  BankProperty,
  PropertyColors,
  PropertyType,
} from '../game/dto/BankProperty';
import { BytesLike, ethers, randomBytes } from 'ethers';
// import { EncodeFunctionDataReturnType } from 'viem/utils/abi/encodeFunctionData';

@Injectable()
export class BlockchainService {
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

  interactOnChain = async (
    target: string,
    encodedData: EncodeFunctionDataReturnType,
    playerIndex: number,
  ) => {
    const response = await this.viemService.sendUserOperation(
      playerIndex,
      target,
      0,
      encodedData,
    );

    console.log('responses ::: ', response);
    return response;
  };

  // getPlayerBalanceInGameBank = async (playerAddress: string)

  // get properties owned by a player in a bank
  // getPropertiesByAPlayer = async (gameBankContractAddress: string, playerAddress: string) => {
  //
  // to create an object it would return
  // };

  async mintToPlayers(
    bankContractAddress: string,
    playersSmartAccount: string[],
  ) {
    const bankContract =
      this.viemService.getBankContractInstance(bankContractAddress);
    // write to the contract
    await bankContract.write.mints([playersSmartAccount, 1500]);
  }

  async getBankProperties(bankContractAddress: string) {
    const bankContract =
      this.ethersService.getBankContractInstance(bankContractAddress);

    const bankProperties: any[] = [];

    for (let i = 1; i < 41; i++) {
      const bankProperty: any = (await bankContract.getProperty.staticCall(
        i,
      )) as [string, string, number, number, string, number, number, number];

      const result = {
        name: ethers.toUtf8String(bankProperty.name),
        uri: ethers.hexlify(bankProperty.uri),
        buyAmount: Number(BigInt(bankProperty.buyAmount)),
        rentAmount: Number(BigInt(bankProperty.rentAmount)),
        owner: bankProperty.owner,
        noOfUpgrades: Number(BigInt(bankProperty.noOfUpgrades)),
        propertyType: Number(bankProperty.propertyType as PropertyType),
        propertyColor: Number(bankProperty.propertyColor as PropertyColors),
      };
      console.log(bankProperty);
      console.log('buy amount ::: ', BigInt(bankProperty.buyAmount));
      bankProperties.push(result);
    }

    return bankProperties;
  }
}
