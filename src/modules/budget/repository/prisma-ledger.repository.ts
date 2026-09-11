import { PrismaService } from '@database';
import {
    ILedgerRepositoryInterface,
    type Ledger,
} from './ledger.repository.interface';
import { TAppendLedger } from '../types/ledger';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaLedgerRepository implements ILedgerRepositoryInterface {
    constructor(private readonly db: PrismaService) {}

    public async findByUser(userId: any): Promise<Ledger[]> {
        return (await this.db.ledger.findMany({
            where: { userId },
        })) as Ledger[];
    }

    public async findPending(userId: string): Promise<Ledger[]> {
        return (await this.db.ledger.findMany({
            where: { userId, publishedAt: null },
        })) as Ledger[];
    }

    public async findAll(userId: string): Promise<Ledger[]> {
        return (await this.db.ledger.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
        })) as Ledger[];
    }

    public async findByReserve(reserveId: string): Promise<Ledger | null> {
        return await this.db.ledger.findFirst({
            where: { reserveId },
        });
    }

    public async findByOrder(orderId: string): Promise<Ledger | null> {
        return await this.db.ledger.findFirst({
            where: { orderId },
        });
    }

    public async appendLedger(data: TAppendLedger): Promise<Ledger | null> {
        const response = await this.db.ledger.create({ data });
        return response;
    }

    public async update(ids: string[]): Promise<void> {
        await this.db.ledger.updateMany({
            where: {
                id: { in: ids },
            },
            data: { publishedAt: new Date() },
        });
    }
}
