import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@auth';
import { DatabaseModule, MongoDBModule } from '@database';
import { BanksModule } from '@banks';
import { ClockModule } from '@clock';
import { BudgetModule } from './modules/budget/budget.module';
import { RedisModule } from './shared/redis/redis.module';
import { ProductModule } from 'modules/products';
import { CartModule } from './modules/cart/cart.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        BanksModule,
        ClockModule,
        BudgetModule,
        RedisModule,
        ProductModule,
        MongoDBModule,
        CartModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
