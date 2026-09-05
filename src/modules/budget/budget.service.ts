import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@database';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    OnModuleInit,
    UnprocessableEntityException,
} from '@nestjs/common';

import { Balance, Ledger } from '@prisma';
import { ReserveBalanceRequestDto } from './dto/reserve-balance-request.dto';
import { UpdateLedger } from './types';
import { CancelReserveRequestDto } from './dto/cancel-reserve-request.dto';
import { Client, Notification } from 'pg';
import { Observable, Subject } from 'rxjs';

const NOTIFICATION = 'balance_notification';
@Injectable()
export class BudgetService implements OnModuleInit, OnModuleDestroy {
    private notifyConnection!: Client;
    private balanceUpdates$ = new Subject<any>();

    constructor(private readonly db: PrismaService) {}

    public async onModuleInit() {
        try {
            const connectionString = process.env.DATABASE_URL;
            if (!connectionString)
                throw new Error(
                    'String de conexão com o banco de dados de notificação não encontrada.',
                );

            this.notifyConnection = new Client({ connectionString });

            await this.notifyConnection.connect();
            this.notifyConnection.query('LISTEN balance_updates');

            this.notifyConnection.on(
                'notification',
                (message: Notification) => {
                    if (
                        message.channel === 'balance_updates' &&
                        message.payload
                    ) {
                        const data = JSON.parse(message.payload);
                        this.balanceUpdates$.next(data);
                    }
                },
            );
        } catch (error) {
            throw error;
        }
    }

    public async onModuleDestroy() {
        !!this.notifyConnection && (await this.notifyConnection.end());
    }

    public async getBalance(userId: string): Promise<Balance | null> {
        try {
            const balance = await this.db.balance.findFirst({
                where: { userId },
                orderBy: { version: 'desc' },
            });
            return balance;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async getLeader(userId: string): Promise<Ledger[]> {
        return await this.db.ledger.findMany({
            where: { userId },
            orderBy: { id: 'desc' },
        });
    }

    public getNotificationStream(): Observable<any> {
        return this.balanceUpdates$.asObservable();
    }

    public async reserveBalance(
        userId: string,
        data: ReserveBalanceRequestDto,
    ): Promise<Balance> {
        try {
            const { amount, orderId, transactionId, version } = data;
            const balance = await this.getBalance(userId);

            if (!balance?.version)
                throw new NotFoundException('Saldo não encontrado');

            if (balance?.available <= 0)
                throw new UnprocessableEntityException('Saldo insuficiente');

            return await this.db.$transaction(async (tx) => {
                const result = await tx.balance
                    .update({
                        where: { userId, version: version },
                        data: {
                            locked: balance.locked + amount,
                            available: balance.available - amount,
                            version: balance.version + 1,
                        },
                    })
                    .catch(() => {
                        throw new ConflictException(
                            'Conflito de idempotência.',
                        );
                    });

                if (result.locked)
                    await this.updateLedger(tx, {
                        userId,
                        type: 'RESERVED',
                        orderId,
                        amount,
                        reserveId: transactionId,
                    });

                return result;
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async cancelReserve(
        userId: string,
        body: CancelReserveRequestDto,
    ): Promise<Balance> {
        const { transactionId, orderId, version } = body;
        const transaction = await this.getLedgerByReserveId(transactionId);

        if (!transaction?.id)
            throw new NotFoundException(
                'Não foi possível encontrar a trasação.',
            );

        const balance = await this.getBalance(userId);

        if (!balance?.userId)
            throw new NotFoundException('Saldo indisponível no momento.');

        if (balance.locked < transaction.amount)
            throw new BadRequestException(
                'Valor de estorno inválido para o saldo bloqueado.',
            );

        return await this.db.$transaction(async (tx) => {
            const result = await tx.balance
                .update({
                    where: { userId, version: version },
                    data: {
                        available: balance.available + transaction.amount,
                        locked: balance.locked - transaction?.amount,
                        version: balance.version + 1,
                    },
                })
                .catch(() => {
                    throw new ConflictException('Conflito de idempotência.');
                });

            if (result.available)
                await this.updateLedger(tx, {
                    userId: transaction.userId,
                    type: 'REFUNDED',
                    orderId,
                    amount: transaction.amount,
                    reserveId: transactionId,
                });

            return result;
        });
    }

    public async doneTransaction(
        userId: string,
        orderId: string,
        version: number,
    ): Promise<Balance | null> {
        const balance = await this.getBalance(userId);
        if (!balance?.userId)
            throw new NotFoundException('Não foi possível encontrar o saldo.');

        const transaction = await this.getLedgerByOrderId(orderId);
        if (!transaction?.userId)
            throw new NotFoundException(
                'Não foi possível encontrar a trasação.',
            );

        return await this.db.$transaction(async (tx) => {
            const result = await tx.balance.update({
                where: { userId, version },
                data: {
                    locked: balance?.locked - transaction.amount,
                    version: balance.version + 1,
                },
            });

            if (result.version)
                await this.updateLedger(tx, {
                    userId: transaction.userId,
                    type: 'WITHDRAW',
                    orderId,
                    amount: transaction.amount,
                    reserveId: transaction.reserveId,
                });

            return result;
        });
    }

    private async updateLedger(
        $transaction: any,
        data: UpdateLedger,
    ): Promise<Ledger | null> {
        try {
            const response = await $transaction.ledger.create({ data });
            return response;
        } catch (error) {
            throw error;
        }
    }

    private async getLedgerByReserveId(
        reserveId: string,
    ): Promise<Ledger | null> {
        try {
            const ledger = await this.db.ledger.findFirst({
                where: { reserveId },
            });
            return ledger;
        } catch (error) {
            throw error;
        }
    }

    private async getLedgerByOrderId(orderId: string): Promise<Ledger | null> {
        try {
            const ledger = await this.db.ledger.findFirst({
                where: { orderId },
            });
            return ledger;
        } catch (error) {
            throw error;
        }
    }
}
