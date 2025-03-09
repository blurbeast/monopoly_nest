import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as PlayerAbi from './abis/PlayerAbi.json';
import * as EntrypointAbi from './abis/EntryPointAbi.json';
import * as SmartAccountAbi from './abis/SmartAccountAbi.json';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class BlockchainService {

    private playerContract: ethers.Contract;
    private entryPointContract: ethers.Contract;
    private defaultWallet: ethers.Wallet;
    private provider: ethers.JsonRpcProvider;
    private entryPointContractAddress: string;

    constructor() {
        if (!process.env.WALLET_KEY ||
            !process.env.PROVIDER_URL ||
            !process.env.ENTRYPOINT_CONTRACT_ADDRESS) {
            throw new Error("could not read from the environment variables");
        }
        this.entryPointContractAddress = process.env.ENTRYPOINT_CONTRACT_ADDRESS as string;
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
            const smartAccount = await factory.deploy(owner, '0xA4744643f0EBaE10F58D4B5DD986594f1eb7ab28');

            // the receipt of the transaction and the event if any 
            smartAccount.waitForDeployment();

            // this returns address of the deployed smart account 
            return smartAccount.target as string;
        } catch (error) {
            console.log("Error deploying smart account ::", error);
            throw new Error(error.shortMessage);
        }
    }
}