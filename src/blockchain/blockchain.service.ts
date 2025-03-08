import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as PlayerAbi from './abis/PlayerAbi.json';
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
        this.entryPointContract = new ethers.Contract(process.env.ENTRYPOINT_CONTRACT_ADDRESS as string, '');
    }


    async registerPlayer(): Promise<string> {

        try {

            return "";
        } catch (error) {
            throw new Error(error);
        }
    }
}