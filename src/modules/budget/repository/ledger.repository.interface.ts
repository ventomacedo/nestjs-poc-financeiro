import { Ledger as LedgerType } from '@prisma';
import { TAppendLedger } from '../types/ledger';

export type Ledger = LedgerType;
export const LEDGER_REPOSITORY = Symbol('LEDGER_REPOSITORY');

export interface ILedgerRepositoryInterface {
    findByUser(userId: string): Promise<Ledger[]>;
    findPending(userId: string): Promise<Ledger[]>;
    findAll(userId: string): Promise<Ledger[]>;
    findByReserve(reserveId: string): Promise<Ledger | null>;
    findByOrder(orderId: string): Promise<Ledger | null>;

    appendLedger(data: TAppendLedger): Promise<Ledger | null>;
    update(ids: string[]): Promise<void>;
}
