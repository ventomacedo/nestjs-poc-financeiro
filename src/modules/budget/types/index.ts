import { Balance, LedgerType } from '@prisma';

export type UpdateLedger = {
    userId: string;
    type: LedgerType;
    orderId: string;
    reserveId: string;
    amount: number;
};

export type NotificationData = {
    data: Balance | { error: string };
};
