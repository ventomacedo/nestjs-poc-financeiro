import { BalanceService } from '../balance.service';
import { IBalanceRepositoryInterface } from '../repository/balance.repository.interface';
import { ReserveBalanceRequestDto } from '../dto/reserve-balance-request.dto';
import { CancelReserveRequestDto } from '../dto/cancel-reserve-request.dto';
import { DoneRequestDto } from '../dto/done-request.dto';

describe('BalanceService', () => {
    let balanceService: BalanceService;
    let balanceRepository: {
        find: jest.Mock;
        reserve: jest.Mock;
        cancel: jest.Mock;
        done: jest.Mock;
    };

    const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
    const balance = {
        userId,
        available: 9000000,
        locked: 1000000,
        version: 2,
    };

    beforeEach(() => {
        balanceRepository = {
            find: jest.fn(),
            reserve: jest.fn(),
            cancel: jest.fn(),
            done: jest.fn(),
        };
        balanceService = new BalanceService(
            balanceRepository as unknown as IBalanceRepositoryInterface,
        );
    });

    describe('getBalance', () => {
        it('delegates to the repository and returns its result', async () => {
            balanceRepository.find.mockResolvedValue(balance);

            const result = await balanceService.getBalance(userId);

            expect(balanceRepository.find).toHaveBeenCalledWith(userId);
            expect(result).toEqual(balance);
        });

        it('returns null when the repository finds nothing', async () => {
            balanceRepository.find.mockResolvedValue(null);

            const result = await balanceService.getBalance(userId);

            expect(result).toBeNull();
        });
    });

    describe('reserve', () => {
        const data: ReserveBalanceRequestDto = {
            transactionId: 'tx-1',
            amount: 100,
            orderId: 'ORDER-0001',
            version: balance.version,
        };

        it('delegates to the repository and returns its result', async () => {
            balanceRepository.reserve.mockResolvedValue(balance);

            const result = await balanceService.reserve(userId, data);

            expect(balanceRepository.reserve).toHaveBeenCalledWith(
                userId,
                data,
            );
            expect(result).toEqual(balance);
        });

        it('propagates the error thrown by the repository', async () => {
            const error = new Error('reserve failed');
            balanceRepository.reserve.mockRejectedValue(error);

            await expect(balanceService.reserve(userId, data)).rejects.toThrow(
                error,
            );
        });
    });

    describe('cancel', () => {
        const data: CancelReserveRequestDto = {
            transactionId: 'tx-1',
            orderId: 'ORDER-0001',
            version: balance.version,
        };

        it('delegates to the repository and returns its result', async () => {
            balanceRepository.cancel.mockResolvedValue(balance);

            const result = await balanceService.cancel(userId, data);

            expect(balanceRepository.cancel).toHaveBeenCalledWith(
                userId,
                data,
            );
            expect(result).toEqual(balance);
        });

        it('propagates the error thrown by the repository', async () => {
            const error = new Error('cancel failed');
            balanceRepository.cancel.mockRejectedValue(error);

            await expect(balanceService.cancel(userId, data)).rejects.toThrow(
                error,
            );
        });
    });

    describe('done', () => {
        const data: DoneRequestDto = {
            orderId: 'ORDER-0001',
            version: balance.version,
        };

        it('delegates to the repository and returns its result', async () => {
            balanceRepository.done.mockResolvedValue(balance);

            const result = await balanceService.done(userId, data);

            expect(balanceRepository.done).toHaveBeenCalledWith(userId, data);
            expect(result).toEqual(balance);
        });

        it('propagates the error thrown by the repository', async () => {
            const error = new Error('done failed');
            balanceRepository.done.mockRejectedValue(error);

            await expect(balanceService.done(userId, data)).rejects.toThrow(
                error,
            );
        });
    });
});
