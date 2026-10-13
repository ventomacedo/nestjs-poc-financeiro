import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderEvents } from './events/order.events';
import { CheckoutRequestDto } from './dto/checkout-request.dto';
import {
    IOrderRepository,
    ORDER_REPOSITORY,
    OrderWithItems,
} from './repository/order.repository.interface';

@Injectable()
export class OrderService {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orders: IOrderRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async checkout(
        userId: string,
        transactionId: string,
        dto: CheckoutRequestDto,
    ): Promise<OrderWithItems> {
        const { total, items } = dto;

        const order = await this.orders.create({
            userId,
            transactionId,
            total,
            items,
        });

        this.eventEmitter.emit(OrderEvents.CREATED, {
            orderId: order.id,
            userId,
            transactionId,
            total,
            items,
        });

        return order;
    }

    public async findAll(userId: string): Promise<OrderWithItems[]> {
        return await this.orders.findAll(userId);
    }

    public async findOne(userId: string, id: string): Promise<OrderWithItems> {
        const order = await this.orders.findById(userId, id);
        if (!order) throw new NotFoundException('Pedido não encontrado');
        return order;
    }

    public async confirm(userId: string, id: string): Promise<OrderWithItems> {
        const order = await this._getReservedOrder(userId, id);

        this.eventEmitter.emit(OrderEvents.CONFIRM_REQUESTED, {
            orderId: order.id,
            userId,
        });

        return order;
    }

    public async cancel(userId: string, id: string): Promise<OrderWithItems> {
        const order = await this._getReservedOrder(userId, id);

        this.eventEmitter.emit(OrderEvents.CANCEL_REQUESTED, {
            orderId: order.id,
            userId,
            transactionId: order.transactionId,
        });

        return order;
    }

    private async _getReservedOrder(
        userId: string,
        id: string,
    ): Promise<OrderWithItems> {
        const order = await this.findOne(userId, id);
        if (order.status !== 'RESERVED')
            throw new BadRequestException(
                `Pedido não está reservado (status atual: ${order.status})`,
            );
        return order;
    }
}
