import { Balance, Prisma } from '@prisma';
import { PrismaService } from '@database';
import { type IBalanceRepositoryInterface } from './balance.repository.interface';
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ReserveBalanceRequestDto } from '../dto/reserve-balance-request.dto';
import { CancelReserveRequestDto } from '../dto/cancel-reserve-request.dto';
import { DoneRequestDto } from '../dto/done-request.dto';

@Injectable()
export class PrismaBalanceRepository implements IBalanceRepositoryInterface {
    constructor(private readonly db: PrismaService) {}

    public async find(userId: string): Promise<Balance | null> {
        return await this.db.balance.findUnique({
            where: { userId },
        });
    }

    public async reserve(
        userId: string,
        data: ReserveBalanceRequestDto,
    ): Promise<Balance> {
        const { version, amount, orderId, transactionId } = data;

        return await this.db.$transaction(
            async (tx) => {
                const balance = await tx.balance.findUnique({
                    where: { userId },
                });

                if (!balance?.userId)
                    throw new NotFoundException('Saldo não encontrado.');

                const result = await tx.balance.update({
                    where: { userId, version },
                    data: {
                        locked: balance.locked + amount,
                        available: balance.available - amount,
                        version: balance.version + 1,
                    },
                });

                if (!result.userId)
                    throw new ConflictException('Conflito de idempotência.');

                if (!!result.userId)
                    await tx.ledger.create({
                        data: {
                            userId,
                            type: 'RESERVED',
                            orderId,
                            amount,
                            reserveId: transactionId,
                        },
                    });

                // Insert In Outbox Table

                return result;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        );
    }

    public async cancel(
        userId: string,
        params: CancelReserveRequestDto,
    ): Promise<Balance> {
        const { version, orderId, transactionId } = params;

        return await this.db.$transaction(
            async (tx) => {
                const balance = await tx.balance.findUnique({
                    where: { userId },
                });

                if (!balance?.userId)
                    throw new NotFoundException('Saldo não encontrado.');

                const ledger = await tx.ledger.findFirst({
                    where: { reserveId: transactionId, type: 'RESERVED' },
                });

                if (!ledger?.userId)
                    throw new NotFoundException(
                        'Evento financeiro não encontrado.',
                    );

                const result = await tx.balance.update({
                    where: { userId, version },
                    data: {
                        available: balance.available + ledger.amount,
                        locked: balance.locked - ledger.amount,
                        version: balance.version + 1,
                    },
                });

                if (!result.userId)
                    throw new ConflictException('Conflito de idempotência.');

                if (!!result.userId)
                    await tx.ledger.create({
                        data: {
                            userId,
                            type: 'REFUNDED',
                            orderId,
                            amount: ledger.amount,
                            reserveId: transactionId,
                        },
                    });

                // Insert In Outbox Table

                return result;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        );
    }

    public async done(userId: string, data: DoneRequestDto): Promise<Balance> {
        const { orderId, version } = data;

        return await this.db.$transaction(
            async (tx) => {
                const balance = await tx.balance.findUnique({
                    where: { userId },
                });

                if (!balance?.userId)
                    throw new NotFoundException('Saldo não encontrado.');

                const ledger = await tx.ledger.findFirst({
                    where: { orderId, type: 'RESERVED' },
                });

                if (!ledger?.userId)
                    throw new NotFoundException(
                        'Evento financeiro não encontrado.',
                    );

                const result = await tx.balance.update({
                    where: { userId, version },
                    data: {
                        locked: balance.locked - ledger.amount,
                        version: balance.version + 1,
                    },
                });

                if (!!result.userId)
                    await tx.ledger.create({
                        data: {
                            userId,
                            type: 'WITHDRAW',
                            orderId,
                            amount: ledger.amount,
                            reserveId: ledger.reserveId,
                        },
                    });

                // Insert In Outbox Table

                return result;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        );
    }
}
