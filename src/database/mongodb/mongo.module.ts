import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './schemas/cart.schema';

const MONGO_URI = `mongodb://${process.env.MONGO_USER}${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

@Module({
    imports: [
        MongooseModule.forRoot(MONGO_URI),
        MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
    ],
    providers: [MongoService],
    exports: [MongoService],
})
export class MongoDBModule {}
