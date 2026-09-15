import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaProductsRepository } from './repository/prisma-products.repository';
import { PRODUCTS_REPOSITORY } from './repository/products.repository';

@Module({
    imports: [],
    controllers: [ProductsController],
    providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useClass: PrismaProductsRepository },
    ],
    exports: [],
})
export class ProductModule {}
