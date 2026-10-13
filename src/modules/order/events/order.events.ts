export const OrderEvents = {
    CREATED: 'order.created',
    CONFIRM_REQUESTED: 'order.confirm-requested',
    CANCEL_REQUESTED: 'order.cancel-requested',
} as const;

export interface OrderCreatedItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface OrderCreatedPayload {
    orderId: string;
    userId: string;
    transactionId: string;
    total: number;
    items: OrderCreatedItem[];
}

export interface OrderConfirmRequestedPayload {
    orderId: string;
    userId: string;
}

export interface OrderCancelRequestedPayload {
    orderId: string;
    userId: string;
    transactionId: string;
}
