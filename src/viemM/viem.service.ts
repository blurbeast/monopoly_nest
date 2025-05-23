import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import {
  Account,
  createPublicClient,
  createWalletClient,
  getAddress,
  getContract,
  Hex,
  http,
} from 'viem';
import { entryPoint07Address } from 'viem/account-abstraction';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';
import { ConfigService } from '@nestjs/config';

import * as BankContract from '../blockchain/abis/BankContract.json';
import * as GameToken from '../blockchain/abis/GameTokenAbi.json';

dotenv.config();

@Injectable()
export class ViemService {
  private readonly privateKey: Account;
  constructor(private readonly configService: ConfigService) {
    this.privateKey = privateKeyToAccount(
      ('0x' + process.env.WALLET_KEY) as Hex,
    );
  }

  publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://eth-sepolia.api.onfinality.io/public'),
  });

  pimlicoUrl = 'https://api.pimlico.io/v2/11155111/rpc?apikey=';
  pimlicoClient = createPimlicoClient({
    transport: http(this.pimlicoUrl + process.env.PIMLICO_SERVICE_SEPOLIA_KEY),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  public account = async (userId: number) => {
    return toSimpleSmartAccount({
      client: this.publicClient,
      owner: privateKeyToAccount(('0x' + process.env.WALLET_KEY) as Hex),
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
      index: BigInt(userId),
    });
  };
  accountClient = async (userId: number) => {
    const acc = await this.account(userId);
    return createSmartAccountClient({
      account: acc,
      chain: sepolia,
      bundlerTransport: http(
        this.pimlicoUrl + process.env.PIMLICO_SERVICE_SEPOLIA_KEY,
      ),
      paymaster: this.pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await this.pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });
  };

  private _createWallet = () => {
    const acc = privateKeyToAccount(
      ('0x' + this.configService.get<string>('WALLET_KEY')) as Hex,
    );
    return createWalletClient({
      account: acc,
      chain: sepolia,
      transport: http(this.configService.get<string>('PROVIDER_URL')),
    });
  };

  deployAContract = async (
    numberOfPlayers: number,
    nftContractAddress: string,
    gameToken: string,
  ): Promise<string> => {
    return `${numberOfPlayers} , ${nftContractAddress}, ${gameToken}`;
  };

  getBankContractInstance = (contractAddress: string) => {
    return getContract({
      address: getAddress(contractAddress),
      abi: BankContract.abi,
      client: this._createWallet(),
    });
  };
  //
  getGameTokenContractInstance = (contractAddress: string) => {
    return getContract({
      address: getAddress(contractAddress),
      abi: GameToken.abi,
      client: this._createWallet(),
    });
  };

  sendUserOperation = async (
    userId: number,
    target: string,
    value: number,
    encodedData: Hex,
  ) => {
    const client = await this.accountClient(userId);
    console.log('target is :: ', target);
    return await client.sendTransaction({
      to: getAddress(target),
      value: BigInt(value),
      data: encodedData,
    });
  };
}
