import { Player } from 'src/player/player.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum GameStatus {
    PENDING, // 0
    ACTIVE, // 1
    ENDED, // 2
}

class Position {
    player!: string;
    spot!: number;
}

@Entity()
export class Game {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ unique: true, type: 'varchar', length: 4 })
    gameRoomId!: string;

    @OneToMany(() => Player, (player) => player.currentGameId, { cascade: true })
    players!: Player[];

    @Column({ unique: true, length: 42, type: 'varchar' })
    bankContractAddress!: string;

    // @Column({ type: 'timestamp', name: 'created_time', default: () => 'CURRENT_TIMESTAMP' })
    @CreateDateColumn({ type: 'timestamp', name: 'created_time', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column()
    currentTurn!: string;

    @Column({ type: 'jsonb', name: 'player_position', nullable: true })
    playerPositions!: Position[];

    @Column({
        enum: GameStatus,
        name: 'game_status',
        enumName: 'status',
        type: 'enum',
        default: GameStatus.PENDING,
    })
    status!: GameStatus;

    @Column({ type: 'timestamp', name: 'ended_time', nullable: true })
    endedAt!: Date;
}
