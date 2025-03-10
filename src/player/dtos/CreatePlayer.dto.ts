
import { IsString } from "class-validator";

export class CreatePlayerDto {

    constructor() { }

    @IsString()
    username!: string;

    @IsString()
    playerAddress!: string;
}