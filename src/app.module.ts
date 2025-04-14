import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PlayerModule } from './player/player.module';
import { GameModule } from './game/game.module';
import { ViemModule } from './viemM/viem.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EthersMModule } from './ethers-m/ethers-m.module';
import { Game } from './game/game.entity';
import { Player } from './player/player.entity';
import { Salted } from './player/salted.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [Game, Player, Salted],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    PlayerModule,
    BlockchainModule,
    GameModule,
    ViemModule,
    EthersMModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
