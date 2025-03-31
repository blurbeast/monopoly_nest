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
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { createSmartAccountClient } from 'permissionless';
import * as BankContract from '../blockchain/abis/BankContract.json';
import * as BankFactory from '../blockchain/abis/BankFactory.json';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
// import * as BankContract from '../blockchain';

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
  ) => {
    // console.log('deployAContract');
    // // create a wallet client
    const walletClient = this._createWallet();
    //
    // const hash = await walletClient.deployContract({
    //   abi: BankContract.abi,
    //   bytecode: BankContract.bytecode.object as `0x${string}`,
    //   args: [
    //     numberOfPlayers,
    //     nftContractAddress,
    //     getAddress('0x4A30f459F694876A5c6b726995274076dcD21E67'),
    //   ],
    //   gas: BigInt(1000000),
    // });
    //
    // const receipt = await this.publicClient.waitForTransactionReceipt({
    //   hash,
    // });
    // console.log(`Deployed at: ${receipt.contractAddress}`);

    const factoryContract = getContract({
      address: getAddress('0xe6f91F1986177a9BB54Bbcb37021422b08EeF3bE'),
      abi: BankFactory.abi,
      client: walletClient,
    });

    const tokenAddress = await factoryContract.read.gameToken();

    console.log('gotten token address is ::: ', tokenAddress);

    const newAddr = await factoryContract.write.deployGameBank([
      numberOfPlayers,
      getAddress(nftContractAddress),
    ]);

    console.log('gotten addr on chain is here ::: ', newAddr);

    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: newAddr,
    });
    console.log('receipt ::: ', receipt);

    const deployedAddress = receipt.logs[0].address;
    console.log('Deployed GameBank Contract Address:', deployedAddress);
    // get the provider
    // const providerUrl = this.configService.get<string>('PROVIDER_URL');
    // // get the pk
    // const pk = this.configService.get<string>('WALLET_KEY');
    // if (!pk) {
    //   throw new Error('Private key is missing from environment variables');
    // }
    // const formattedPk = pk.startsWith('0x') ? pk : '0x' + pk;
    //
    // const provider = new ethers.JsonRpcProvider(providerUrl);
    // const wallet = new ethers.Wallet(formattedPk, provider);
    //
    // const factory = new ethers.ContractFactory(
    //   BankContract.abi,
    //   BankContract.bytecode.object,
    //   wallet,
    // );
    //
    // const f = await factory.deploy(
    //   numberOfPlayers,
    //   nftContractAddress,
    //   '0x4A30f459F694876A5c6b726995274076dcD21E67',
    // );
    //
    // await f.waitForDeployment();
    // console.log('target is ', f.target);
    return 'f.target as string';
  };

  getAContractInstance = (contractAddress: string) => {
    return getContract({
      address: getAddress(contractAddress),
      abi: BankContract.abi,
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
