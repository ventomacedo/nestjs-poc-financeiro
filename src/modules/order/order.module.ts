import { Module } from '@nestjs/common';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ORDER_REPOSITORY } from './repository/order.repository.interface';
import { PrismaOrderRepository } from './repository/prisma-order.repository';

@Module({
    imports: [],
    controllers: [OrderController],
    providers: [
        OrderService,
        { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    ],
    exports: [],
})
export class OrderModule {}
