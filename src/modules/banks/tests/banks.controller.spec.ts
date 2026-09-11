import { BanksController } from '../banks.controller';
import { BanksService } from '../banks.service';
import { CreateBankRequestDto } from '../dto/create-bank-request.dto';

describe('BanksController', () => {
    let banksController: BanksController;
    let banksService: {
        getBanks: jest.Mock;
        findBankById: jest.Mock;
        createBank: jest.Mock;
        updateBank: jest.Mock;
        deleteBank: jest.Mock;
    };

    const bank = {
        id: 'bank-id',
        taxId: '11222333000181',
        name: 'Monopoly Bank',
        fantasyName: 'Banco imobiliário',
        ispb: '001',
        compeCode: '00000001',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    beforeEach(() => {
        banksService = {
            getBanks: jest.fn(),
            findBankById: jest.fn(),
            createBank: jest.fn(),
            updateBank: jest.fn(),
            deleteBank: jest.fn(),
        };
        banksController = new BanksController(
            banksService as unknown as BanksService,
        );
    });

    describe('getBanks', () => {
        it('delegates to BanksService.getBanks', async () => {
            banksService.getBanks.mockResolvedValue([bank]);

            const result =
                (await banksController.getBanks()) as (typeof bank)[];

            expect(banksService.getBanks).toHaveBeenCalledWith();
            expect(result).toEqual([bank]);
        });
    });

    describe('findBanksById', () => {
        it('delegates to BanksService.findBankById with the id from the route', async () => {
            banksService.findBankById.mockResolvedValue([bank]);

            const result = (await banksController.findBanksById(
                bank.id,
            )) as (typeof bank)[];

            expect(banksService.findBankById).toHaveBeenCalledWith(bank.id);
            expect(result).toEqual([bank]);
        });
    });

    describe('createBanks', () => {
        it('delegates to BanksService.createBank with the body', async () => {
            const body: CreateBankRequestDto = {
                taxId: bank.taxId,
                name: bank.name,
                fantasyName: bank.fantasyName,
                ispb: bank.ispb,
                compeCode: bank.compeCode,
            };
            banksService.createBank.mockResolvedValue(bank);

            const result = await banksController.createBanks(body);

            expect(banksService.createBank).toHaveBeenCalledWith(body);
            expect(result).toEqual(bank);
        });
    });

    describe('updateBanks', () => {
        it('delegates to BanksService.updateBank with the body and the id from the route', async () => {
            const body: CreateBankRequestDto = {
                taxId: bank.taxId,
                name: bank.name,
                fantasyName: bank.fantasyName,
                ispb: bank.ispb,
                compeCode: bank.compeCode,
            };
            banksService.updateBank.mockResolvedValue(bank);

            const result = await banksController.updateBanks(bank.id, body);

            expect(banksService.updateBank).toHaveBeenCalledWith(body, bank.id);
            expect(result).toEqual(bank);
        });
    });

    describe('deleteBanks', () => {
        it('delegates to BanksService.deleteBank with the id from the route', async () => {
            banksService.deleteBank.mockResolvedValue(undefined);

            const result = await banksController.deleteBanks(bank.id);

            expect(banksService.deleteBank).toHaveBeenCalledWith(bank.id);
            expect(result).toBeUndefined();
        });
    });
});
