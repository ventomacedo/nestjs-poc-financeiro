import {
    Order as OrderType,
    OrderItem as OrderItemType,
    OrderStatus as OrderStatusType,
} from '@prisma';

export type Order = OrderType;
export type OrderItem = OrderItemType;
export type OrderStatus = OrderStatusType;
export type OrderWithItems = Order & { items: OrderItem[] };

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export type CreateOrderItemInput = {
    productId: string;
    name: string;
    quantity: number;
    price: number;
};

export type CreateOrderInput = {
    userId: string;
    transactionId: string;
    total: number;
    items: CreateOrderItemInput[];
};

export interface IOrderRepository {
    create(data: CreateOrderInput): Promise<OrderWithItems>;
    findAll(userId: string): Promise<OrderWithItems[]>;
    findById(userId: string, id: string): Promise<OrderWithItems | null>;
    updateStatus(id: string, status: OrderStatus): Promise<OrderWithItems>;
}
