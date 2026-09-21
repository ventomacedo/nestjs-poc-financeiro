import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongoDBProductsRepository } from './repository/mongo-products.repository';
import { PRODUCTS_REPOSITORY } from './repository/products.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsSchema } from 'database/mongodb/schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Products', schema: ProductsSchema },
        ]),
    ],
    controllers: [ProductsController],
    providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useClass: MongoDBProductsRepository },
    ],
    exports: [],
})
export class ProductModule {}
