import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as PlayerAbi from './abis/PlayerAbi.json';
import * as EntrypointAbi from './abis/EntryPointAbi.json';
// import * as SmartAccountAbi from './abis/SmartAccountAbi.json';
import * as dotenv from 'dotenv';
import { PimlicoService } from '../pimlico/pimlico.service';
import { encodeFunctionData, parseAbi } from 'viem';
dotenv.config();

@Injectable()
export class BlockchainService {
  private playerContract: ethers.Contract;
  private entryPointContract: ethers.Contract;
  private readonly defaultWallet: ethers.Wallet;
  private readonly provider: ethers.JsonRpcProvider;
  private entryPointContractAddress: string;
  // private pimlicoService: PimlicoService;

  constructor(private pimlicoService: PimlicoService) {
    if (
      !process.env.WALLET_KEY ||
      !process.env.PROVIDER_URL ||
      !process.env.ENTRYPOINT_CONTRACT_ADDRESS
    ) {
      throw new Error('could not read from the environment variables');
    }
    this.entryPointContractAddress = process.env.ENTRYPOINT_CONTRACT_ADDRESS;
    this.provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
    this.defaultWallet = new ethers.Wallet(
      process.env.WALLET_KEY,
      this.provider,
    );
    this.playerContract = new ethers.Contract(
      process.env.PLAYER_CONTRACT_ADDRESS as string,
      PlayerAbi,
      this.defaultWallet,
    );
    this.entryPointContract = new ethers.Contract(
      process.env.ENTRYPOINT_CONTRACT_ADDRESS,
      EntrypointAbi,
      this.defaultWallet,
    );
  }

  createSmartAccount = async (userId: number) => {
    const newSmartAccount = await this.pimlicoService.account(userId);
    const userAddress: string = newSmartAccount.address;

    return userAddress;
  };

  interactOnChain = async (target: string) => {
    const encodedData = encodeFunctionData({
      abi: parseAbi([
        'function setCount(uint256 _value) external returns (uint256)',
      ]),
      functionName: 'setCount',
      args: [BigInt(30100)],
    });

    const response = await this.pimlicoService.sendUserOperation(
      3,
      target,
      0,
      encodedData,
    );

    console.log('responses ::: ', response);
    return response;
  };
}
