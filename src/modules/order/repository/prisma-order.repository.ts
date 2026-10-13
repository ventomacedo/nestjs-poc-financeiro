import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database';
import {
    CreateOrderInput,
    IOrderRepository,
    OrderStatus,
    OrderWithItems,
} from './order.repository.interface';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
    constructor(private readonly db: PrismaService) {}

    public async create(data: CreateOrderInput): Promise<OrderWithItems> {
        const { userId, transactionId, total, items } = data;

        return await this.db.order.create({
            data: {
                userId,
                transactionId,
                total,
                items: { create: items },
            },
            include: { items: true },
        });
    }

    public async findAll(userId: string): Promise<OrderWithItems[]> {
        return await this.db.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    public async findById(
        userId: string,
        id: string,
    ): Promise<OrderWithItems | null> {
        return await this.db.order.findFirst({
            where: { id, userId },
            include: { items: true },
        });
    }

    public async updateStatus(
        id: string,
        status: OrderStatus,
    ): Promise<OrderWithItems> {
        return await this.db.order.update({
            where: { id },
            data: { status },
            include: { items: true },
        });
    }
}
