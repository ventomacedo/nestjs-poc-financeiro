import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderService } from '../order.service';
import { IOrderRepository } from '../repository/order.repository.interface';
import { CheckoutRequestDto } from '../dto/checkout-request.dto';
import { OrderEvents } from '../events/order.events';

describe('OrderService', () => {
    let orderService: OrderService;
    let orders: { [K in keyof IOrderRepository]: jest.Mock };
    let eventEmitter: { emit: jest.Mock };

    const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
    const transactionId = 'tx-order-1';

    const checkoutDto: CheckoutRequestDto = {
        total: 3000,
        items: [
            {
                productId: 'product-1',
                name: 'Produto Teste',
                quantity: 2,
                price: 1500,
            },
        ],
    };

    const orderPending = {
        id: 'order-1',
        userId,
        status: 'PENDING',
        total: checkoutDto.total,
        transactionId,
        createdAt: new Date(),
        updatedAt: null,
        items: checkoutDto.items.map((item, index) => ({
            id: `item-${index}`,
            orderId: 'order-1',
            ...item,
        })),
    };

    beforeEach(() => {
        orders = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
        };
        eventEmitter = { emit: jest.fn() };

        orderService = new OrderService(
            orders as unknown as IOrderRepository,
            eventEmitter as unknown as EventEmitter2,
        );
    });

    describe('checkout', () => {
        it('creates the order and announces order.created without waiting on listeners', async () => {
            orders.create.mockResolvedValue(orderPending);

            const result = await orderService.checkout(
                userId,
                transactionId,
                checkoutDto,
            );

            expect(orders.create).toHaveBeenCalledWith({
                userId,
                transactionId,
                total: checkoutDto.total,
                items: checkoutDto.items,
            });
            expect(eventEmitter.emit).toHaveBeenCalledWith(
                OrderEvents.CREATED,
                {
                    orderId: orderPending.id,
                    userId,
                    transactionId,
                    total: checkoutDto.total,
                    items: checkoutDto.items,
                },
            );
            expect(result).toEqual(orderPending);
        });

        it('propagates a repository failure without emitting the event', async () => {
            const error = new Error('db offline');
            orders.create.mockRejectedValue(error);

            await expect(
                orderService.checkout(userId, transactionId, checkoutDto),
            ).rejects.toThrow(error);
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('returns the order when found', async () => {
            orders.findById.mockResolvedValue(orderPending);

            const result = await orderService.findOne(userId, 'order-1');

            expect(orders.findById).toHaveBeenCalledWith(userId, 'order-1');
            expect(result).toEqual(orderPending);
        });

        it('throws NotFoundException when the order does not exist', async () => {
            orders.findById.mockResolvedValue(null);

            await expect(
                orderService.findOne(userId, 'unknown'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('confirm', () => {
        const reserved = { ...orderPending, status: 'RESERVED' as const };

        it('announces order.confirm-requested for a reserved order', async () => {
            orders.findById.mockResolvedValue(reserved);

            const result = await orderService.confirm(userId, reserved.id);

            expect(eventEmitter.emit).toHaveBeenCalledWith(
                OrderEvents.CONFIRM_REQUESTED,
                { orderId: reserved.id, userId },
            );
            expect(result).toEqual(reserved);
        });

        it('throws when the order is not reserved', async () => {
            orders.findById.mockResolvedValue(orderPending);

            await expect(
                orderService.confirm(userId, orderPending.id),
            ).rejects.toBeInstanceOf(BadRequestException);
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        const reserved = { ...orderPending, status: 'RESERVED' as const };

        it('announces order.cancel-requested for a reserved order', async () => {
            orders.findById.mockResolvedValue(reserved);

            const result = await orderService.cancel(userId, reserved.id);

            expect(eventEmitter.emit).toHaveBeenCalledWith(
                OrderEvents.CANCEL_REQUESTED,
                {
                    orderId: reserved.id,
                    userId,
                    transactionId: reserved.transactionId,
                },
            );
            expect(result).toEqual(reserved);
        });

        it('throws when the order is not reserved', async () => {
            orders.findById.mockResolvedValue(orderPending);

            await expect(
                orderService.cancel(userId, orderPending.id),
            ).rejects.toBeInstanceOf(BadRequestException);
            expect(eventEmitter.emit).not.toHaveBeenCalled();
        });
    });
});
