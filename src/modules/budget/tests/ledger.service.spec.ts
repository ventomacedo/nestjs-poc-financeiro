import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { LedgerService } from '../ledger.service';
import { ILedgerRepositoryInterface } from '../repository/ledger.repository.interface';
import { IBalanceRepositoryInterface } from '../repository/balance.repository.interface';

describe('LedgerService', () => {
    let ledgerService: LedgerService;
    let ledgerRepository: {
        findByUser: jest.Mock;
        findPending: jest.Mock;
        findAll: jest.Mock;
        findByReserve: jest.Mock;
        findByOrder: jest.Mock;
        appendLedger: jest.Mock;
        update: jest.Mock;
    };
    let balanceRepository: { find: jest.Mock };

    const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
    const balance = {
        userId,
        available: 9000000,
        locked: 1000000,
        version: 2,
    };
    const ledgerEntry = {
        id: '01a06f66-16df-728f-a840-b5fedd5ecbee',
        userId,
        type: 'RESERVED' as const,
        orderId: 'ORDER-0001',
        reserveId: 'tx-1',
        amount: 1500000,
        timestamp: new Date('2026-09-05T02:28:26.791Z'),
        publishedAt: null,
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        ledgerRepository = {
            findByUser: jest.fn(),
            findPending: jest.fn(),
            findAll: jest.fn(),
            findByReserve: jest.fn(),
            findByOrder: jest.fn(),
            appendLedger: jest.fn(),
            update: jest.fn(),
        };
        balanceRepository = { find: jest.fn() };
        ledgerService = new LedgerService(
            ledgerRepository as unknown as ILedgerRepositoryInterface,
            balanceRepository as unknown as IBalanceRepositoryInterface,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getLeader', () => {
        it('delegates to the repository and returns its result', async () => {
            ledgerRepository.findAll.mockResolvedValue([ledgerEntry]);

            const result = await ledgerService.getLeader(userId);

            expect(ledgerRepository.findAll).toHaveBeenCalledWith(userId);
            expect(result).toEqual([ledgerEntry]);
        });
    });

    describe('pollerLedger', () => {
        it('marks pending ledgers as published and emits the current balance', async () => {
            ledgerRepository.findPending.mockResolvedValue([ledgerEntry]);
            balanceRepository.find.mockResolvedValue(balance);

            const result = await firstValueFrom(
                ledgerService.pollerLedger(userId).pipe(take(1)),
            );

            expect(ledgerRepository.findPending).toHaveBeenCalledWith(userId);
            expect(ledgerRepository.update).toHaveBeenCalledWith([
                ledgerEntry.id,
            ]);
            expect(result).toEqual({ data: { ...balance } });
        });

        it('skips marking ledgers as published when there is nothing pending', async () => {
            ledgerRepository.findPending.mockResolvedValue([]);
            balanceRepository.find.mockResolvedValue(balance);

            const result = await firstValueFrom(
                ledgerService.pollerLedger(userId).pipe(take(1)),
            );

            expect(ledgerRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual({ data: { ...balance } });
        });

        it('emits an error payload instead of throwing when the repository fails', async () => {
            ledgerRepository.findPending.mockRejectedValue(
                new Error('db offline'),
            );

            const result = await firstValueFrom(
                ledgerService.pollerLedger(userId).pipe(take(1)),
            );

            expect(result).toEqual({ data: { error: 'Banco indisponível.' } });
        });
    });
});
