import { LedgerType } from '@prisma';

export type TAppendLedger = {
    userId: string;
    type: LedgerType;
    orderId: string;
    reserveId: string;
    amount: number;
};
