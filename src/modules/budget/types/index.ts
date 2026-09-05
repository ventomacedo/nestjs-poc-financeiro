import { LedgerType } from '@prisma';

export type UpdateLedger = {
    userId: string;
    type: LedgerType;
    orderId: string;
    reserveId: string;
    amount: number;
};
