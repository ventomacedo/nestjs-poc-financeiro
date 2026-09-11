import { BudgetService } from '../budget.service';
import { BalanceService } from '../balance.service';
import { LedgerService } from '../ledger.service';
import { ReserveBalanceRequestDto } from '../dto/reserve-balance-request.dto';
import { CancelReserveRequestDto } from '../dto/cancel-reserve-request.dto';
import { DoneRequestDto } from '../dto/done-request.dto';

describe('BudgetService', () => {
    let budgetService: BudgetService;
    let balanceService: {
        getBalance: jest.Mock;
        reserve: jest.Mock;
        cancel: jest.Mock;
        done: jest.Mock;
    };
    let ledgerService: {
        getLeader: jest.Mock;
        pollerLedger: jest.Mock;
    };

    const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
    const balance = {
        userId,
        available: 9000000,
        locked: 1000000,
        version: 2,
    };

    beforeEach(() => {
        balanceService = {
            getBalance: jest.fn(),
            reserve: jest.fn(),
            cancel: jest.fn(),
            done: jest.fn(),
        };
        ledgerService = {
            getLeader: jest.fn(),
            pollerLedger: jest.fn(),
        };
        budgetService = new BudgetService(
            balanceService as unknown as BalanceService,
            ledgerService as unknown as LedgerService,
        );
    });

    it('delegates getBalance to BalanceService', async () => {
        balanceService.getBalance.mockResolvedValue(balance);

        const result = await budgetService.getBalance(userId);

        expect(balanceService.getBalance).toHaveBeenCalledWith(userId);
        expect(result).toEqual(balance);
    });

    it('delegates getLeader to LedgerService', async () => {
        const ledgerList = [{ id: 'ledger-1' }];
        ledgerService.getLeader.mockResolvedValue(ledgerList);

        const result = await budgetService.getLeader(userId);

        expect(ledgerService.getLeader).toHaveBeenCalledWith(userId);
        expect(result).toEqual(ledgerList);
    });

    it('delegates getNotificationStream to LedgerService.pollerLedger', () => {
        const stream = { subscribe: jest.fn() };
        ledgerService.pollerLedger.mockReturnValue(stream);

        const result = budgetService.getNotificationStream(userId);

        expect(ledgerService.pollerLedger).toHaveBeenCalledWith(userId);
        expect(result).toBe(stream);
    });

    it('delegates reserveBalance to BalanceService.reserve', async () => {
        const data: ReserveBalanceRequestDto = {
            transactionId: 'tx-1',
            amount: 100,
            orderId: 'ORDER-0001',
            version: balance.version,
        };
        balanceService.reserve.mockResolvedValue(balance);

        const result = await budgetService.reserveBalance(userId, data);

        expect(balanceService.reserve).toHaveBeenCalledWith(userId, data);
        expect(result).toEqual(balance);
    });

    it('delegates cancelReserve to BalanceService.cancel', async () => {
        const data: CancelReserveRequestDto = {
            transactionId: 'tx-1',
            orderId: 'ORDER-0001',
            version: balance.version,
        };
        balanceService.cancel.mockResolvedValue(balance);

        const result = await budgetService.cancelReserve(userId, data);

        expect(balanceService.cancel).toHaveBeenCalledWith(userId, data);
        expect(result).toEqual(balance);
    });

    it('delegates doneTransaction to BalanceService.done', async () => {
        const data: DoneRequestDto = {
            orderId: 'ORDER-0001',
            version: balance.version,
        };
        balanceService.done.mockResolvedValue(balance);

        const result = await budgetService.doneTransaction(userId, data);

        expect(balanceService.done).toHaveBeenCalledWith(userId, data);
        expect(result).toEqual(balance);
    });
});
