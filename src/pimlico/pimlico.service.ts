import { Injectable } from '@nestjs/common';
import { sepolia } from 'viem/chains';
import { entryPoint07Address } from 'viem/account-abstraction';
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import * as dotenv from 'dotenv';
import {
  http,
  createPublicClient,
  // getAddress,
  // parseAbi,
  // getContract,
} from 'viem';
import { toKernelSmartAccount } from 'permissionless/accounts';
import * as process from 'node:process';
import { privateKeyToAccount } from 'viem/accounts';
dotenv.config();

@Injectable()
export class PimlicoService {
  private readonly serverUrlAndKey: string;
  constructor() {
    if (!process.env.PIMLICO_SERVICE_SEPOLIA_KEY) {
      throw new Error('could not locate key');
    }
    this.serverUrlAndKey =
      'https://api.pimlico.io/v2/11155111/rpc?apikey=' +
        process.env.PIMLICO_SERVICE_SEPOLIA_KEY || '';
  }
  // create a public client
  // public client is used to read from the state
  public publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://eth-sepolia.api.onfinality.io/public'),
  });

  // create a pimlico client which would act as a bundler here
  public pimlicoClient = createPimlicoClient({
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
    transport: http(
      'https://api.pimlico.io/v2/11155111/rpc?apikey=' +
        process.env.PIMLICO_SERVICE_SEPOLIA_KEY,
    ),
  });

  // create a smart account or get a smart account
  private async createSmartAccount(userId: number) {
    return toKernelSmartAccount({
      client: this.publicClient,
      owners: [privateKeyToAccount(`0x${process.env.WALLET_KEY}`)],
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
      index: BigInt(userId),
    });
  }

  public async getSmartAccountClient(userId: number) {
    const smartAccount = await this.createSmartAccount(userId);

    return createSmartAccountClient({
      account: smartAccount,
      chain: sepolia,
      bundlerTransport: http(
        'https://api.pimlico.io/v2/11155111/rpc?apikey=' +
          process.env.PIMLICO_SERVICE_SEPOLIA_KEY,
      ),
      paymaster: this.pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          const gasPrice = await this.pimlicoClient.getUserOperationGasPrice();
          return gasPrice.fast;
        },
      },
    });
  }
}
