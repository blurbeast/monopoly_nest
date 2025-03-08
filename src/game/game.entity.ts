import { Player } from 'src/player/player.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true, type: 'char', length: 4 })
    gameRoomId: string;

    @Column({ name: 'game_players' })
    @OneToMany(() => Player, (player) => player.walletAddress, { cascade: true })
    players: Player[]

    @Column({ unique: true, length: 42, type: 'varchar' })
    bankContractAddress: string;

    @Column({ type: 'timestamp', name: 'created_time', })
    createAt: Date;

    @Column()
    currentTurn: string;

    @Column({ type: 'timestamp', name: 'ended_time', })
    endedAt: Date;
}
