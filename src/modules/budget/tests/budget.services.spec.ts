import { BudgetService } from '../budget.service';
import { PrismaService } from '@database';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { LedgerType } from '@prisma';

describe('BudgetService', () => {
    let service: BudgetService;
    let prismaMock: DeepMockProxy<PrismaService>;

    beforeEach(async () => {
        prismaMock = mockDeep<PrismaService>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<BudgetService>(BudgetService);
    });

    it('returns balance data from getBalance', async () => {
        const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
        const mockBalance = {
            userId: userId,
            available: 9000000,
            locked: 1000000,
            version: 2,
            updateAt: new Date('2026-09-04T20:18:34.931Z'),
        };

        prismaMock.balance.findFirst.mockResolvedValue(mockBalance);
        const result = await service.getBalance(userId);

        expect(result).toEqual(mockBalance);
        expect(prismaMock.balance.findFirst).toHaveBeenCalledTimes(1);
        expect(prismaMock.balance.findFirst).toHaveBeenCalledWith({
            where: { userId },
            orderBy: { version: 'desc' },
        });
    });
    it('returns ledger list from getLeader', async () => {
        const userId = '01a06a00-167b-701c-bcee-efc62fc6d364';
        const mockLedger = [
            {
                id: '01a06f66-16df-728f-a840-b5fedd5ecbee',
                userId: '01a025b8-e5f5-75c4-acd8-76bf78a25ee2',
                type: 'REFUNDED' as LedgerType,
                orderId: 'ORDER-0002',
                reserveId: '01a06a00-167b-77a2-8e27-af2611ee3acf',
                amount: 1500000,
                timestamp: new Date('2026-09-05T02:29:16.639Z'),
                displayType: 'Estornado',
            },
            {
                id: '01a06f65-5426-7098-8375-bac6e79aed16',
                userId: '01a025b8-e5f5-75c4-acd8-76bf78a25ee2',
                type: 'RESERVED' as LedgerType,
                orderId: 'ORDER-0002',
                reserveId: '01a06a00-167b-77a2-8e27-af2611ee3acf',
                amount: 1500000,
                timestamp: new Date('2026-09-05T02:28:26.791Z'),
                displayType: 'Reservado',
            },
        ];

        prismaMock.ledger.findMany.mockResolvedValue(mockLedger);
        const result = await service.getLeader(userId);

        expect(result).toEqual(mockLedger);
        expect(prismaMock.ledger.findMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.ledger.findMany).toHaveBeenCalledWith({
            where: { userId },
            orderBy: { id: 'desc' },
        });
    });
});
