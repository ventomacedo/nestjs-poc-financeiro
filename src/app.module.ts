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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 1000, limit: 10 }]),
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
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, AppService],
})
export class AppModule {}
