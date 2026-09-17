import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CART_REPOSITORY } from './repository/cart.repository.interface';
import { MongoDbCartRepository } from './repository/mongo-cart.repository';
import { CartSchema } from 'database/mongodb/schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }])],
    controllers: [CartController],
    providers: [
        CartService,
        { provide: CART_REPOSITORY, useClass: MongoDbCartRepository },
    ],
    exports: [],
})
export class CartModule {}
