import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as PlayerAbi from './abis/PlayerAbi.json';
import * as EntrypointAbi from './abis/EntryPointAbi.json';
import * as SmartAccountAbi from './abis/SmartAccountAbi.json';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class BlockchainService {

    private readonly playerContract: ethers.Contract;
    private readonly entryPointContract: ethers.Contract;
    private readonly defaultWallet: ethers.Wallet;
    private readonly provider: ethers.JsonRpcProvider;
    private readonly cntryPointContractAddress: string;

    constructor() {
        if (!process.env.WALLET_KEY ||
            !process.env.PROVIDER_URL ||
            !process.env.ENTRYPOINT_CONTRACT_ADDRESS) {
            throw new Error("could not read from the environment variables");
        }
        this.cntryPointContractAddress = process.env.ENTRYPOINT_CONTRACT_ADDRESS;
        this.provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL as string);
        this.defaultWallet = new ethers.Wallet(
            process.env.WALLET_KEY as string,
            this.provider
        );
        this.playerContract = new ethers.Contract(process.env.PLAYER_CONTRACT_ADDRESS as string, PlayerAbi, this.defaultWallet);
        this.entryPointContract = new ethers.Contract(process.env.ENTRYPOINT_CONTRACT_ADDRESS as string, EntrypointAbi, this.defaultWallet);
    }

    async deploySmartAccount(owner: string): Promise<string> {
        try {

            if (!owner.startsWith('0x') && !(owner.length === 42)) {
                throw new Error(`invalid address provided ${owner}`);
            }
            // call on the factory to create instance so as to deploy the contract 
            const factory = new ethers.ContractFactory(
                SmartAccountAbi.abi,
                SmartAccountAbi.bytecode,
                this.defaultWallet
            );

            // the smart account takes two arguement upon deploying
            const smartAccount = await factory.deploy(owner, this.cntryPointContractAddress);

            // the receipt of the transaction and the event if any 
            smartAccount.waitForDeployment();

            // this returns address of the deployed smart account 
            return smartAccount.target as string;
        } catch (error) {
            throw new Error(error.shortMessage);
        }
    }
}