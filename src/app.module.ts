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
import { CartModule } from './modules/cart/cart.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PostsModule } from 'modules/posts';
import { ProductModule } from 'modules/products';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

const RedisCacheModule = CacheModule.registerAsync({
    isGlobal: true,
    useFactory: () => ({
        stores: [
            new KeyvRedis(
                `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ),
        ],
        ttl: 60_000,
    }),
});

@Module({
    imports: [
        RedisCacheModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([{ ttl: 1000, limit: 10 }]),
        EventEmitterModule.forRoot(),
        DatabaseModule,
        AuthModule,
        BanksModule,
        ClockModule,
        BudgetModule,
        RedisModule,
        PostsModule,
        ProductModule,
        MongoDBModule,
        CartModule,
    ],
    controllers: [AppController],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, AppService],
})
export class AppModule {}
