import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createPublicClient, getAddress, Hex, http } from 'viem';
import * as process from 'node:process';
import { entryPoint07Address } from 'viem/account-abstraction';
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';

dotenv.config();

@Injectable()
export class PimlicoService {
  // private readonly
  constructor() {}

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
    return toEcdsaKernelSmartAccount({
      client: this.publicClient,
      owners: [privateKeyToAccount(('0x' + process.env.WALLET_KEY) as Hex)],
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

  sendUserOperation = async (
    userId: number,
    target: string,
    value: number,
    encodedData: Hex,
  ) => {
    const client = await this.accountClient(userId);
    return await client.sendTransaction({
      to: getAddress(target),
      value: BigInt(value),
      data: encodedData,
    });
  };
}
