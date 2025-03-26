import { Injectable } from '@nestjs/common';
import { ViemService } from '../viemM/viem.service';
import { encodeFunctionData, parseAbi } from 'viem';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  // private playerContract: ethers.Contract;
  // private entryPointContract: ethers.Contract;
  // private readonly defaultWallet: ethers.Wallet;
  // private readonly provider: ethers.JsonRpcProvider;
  // private entryPointContractAddress: string;

  constructor(
    private readonly pimlicoService: ViemService,
    private readonly configService: ConfigService,
  ) {}

  createSmartAccount = async (userId: number) => {
    const newSmartAccount = await this.pimlicoService.account(userId);
    const userAddress: string = newSmartAccount.address;

    return userAddress;
  };

  deployBankContract = () => {
    // using libraries like ethers or viem to deploy the contract


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
