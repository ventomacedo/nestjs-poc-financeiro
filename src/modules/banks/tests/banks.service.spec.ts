import { NotFoundException } from '@nestjs/common';

import { BanksService } from '../banks.service';
import { CreateBankRequestDto } from '../dto/create-bank-request.dto';
import { UpdateBankRequestDto } from '../dto/update-bank-request.dto';
import { IBankRepository } from '../repositories/bank.repository.interface';

describe('BanksService', () => {
    let banksService: BanksService;
    let banksRepository: {
        findAll: jest.Mock;
        find: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
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
        banksRepository = {
            findAll: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        banksService = new BanksService(
            banksRepository as unknown as IBankRepository,
        );
    });

    describe('getBanks', () => {
        it('returns the list of financial institutions', async () => {
            banksRepository.findAll.mockResolvedValue([bank]);

            const result = await banksService.getBanks();

            expect(banksRepository.findAll).toHaveBeenCalledWith();
            expect(result).toEqual([bank]);
        });

        it('propagates the error when the query fails', async () => {
            const error = new Error('db offline');
            banksRepository.findAll.mockRejectedValue(error);

            await expect(banksService.getBanks()).rejects.toThrow(error);
        });
    });

    describe('findBankById', () => {
        it('returns the institution found by id', async () => {
            banksRepository.find.mockResolvedValue(bank);

            const result = await banksService.findBankById(bank.id);

            expect(banksRepository.find).toHaveBeenCalledWith(bank.id);
            expect(result).toEqual(bank);
        });

        it('propagates the error when the query fails', async () => {
            const error = new Error('db offline');
            banksRepository.find.mockRejectedValue(error);

            await expect(banksService.findBankById(bank.id)).rejects.toThrow(
                error,
            );
        });
    });

    describe('createBank', () => {
        const createDto: CreateBankRequestDto = {
            taxId: bank.taxId,
            name: bank.name,
            fantasyName: bank.fantasyName,
            ispb: bank.ispb,
            compeCode: bank.compeCode,
        };

        it('creates and returns the financial institution', async () => {
            banksRepository.create.mockResolvedValue(bank);

            const result = await banksService.createBank(createDto);

            expect(banksRepository.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(bank);
        });

        it('propagates the error when creation fails', async () => {
            const error = new Error('create failed');
            banksRepository.create.mockRejectedValue(error);

            await expect(banksService.createBank(createDto)).rejects.toThrow(
                error,
            );
        });
    });

    describe('updateBank', () => {
        const updateDto: UpdateBankRequestDto = {
            taxId: bank.taxId,
            name: bank.name,
            fantasyName: bank.fantasyName,
            ispb: bank.ispb,
            compeCode: bank.compeCode,
        };

        it('updates and returns the financial institution', async () => {
            banksRepository.update.mockResolvedValue(bank);

            const result = await banksService.updateBank(updateDto, bank.id);

            expect(banksRepository.update).toHaveBeenCalledWith(
                bank.id,
                updateDto,
            );
            expect(result).toEqual(bank);
        });

        it('throws NotFoundException when no record is updated', async () => {
            banksRepository.update.mockResolvedValue(null);

            await expect(
                banksService.updateBank(updateDto, 'unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propagates the error when the update fails', async () => {
            const error = new Error('update failed');
            banksRepository.update.mockRejectedValue(error);

            await expect(
                banksService.updateBank(updateDto, bank.id),
            ).rejects.toThrow(error);
        });
    });

    describe('deleteBank', () => {
        it('removes the financial institution', async () => {
            banksRepository.delete.mockResolvedValue({ id: bank.id });

            await expect(
                banksService.deleteBank(bank.id),
            ).resolves.toBeUndefined();
            expect(banksRepository.delete).toHaveBeenCalledWith(bank.id);
        });

        it('throws NotFoundException when no record is removed', async () => {
            banksRepository.delete.mockResolvedValue({ id: undefined });

            await expect(
                banksService.deleteBank('unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propagates the error when removal fails', async () => {
            const error = new Error('delete failed');
            banksRepository.delete.mockRejectedValue(error);

            await expect(banksService.deleteBank(bank.id)).rejects.toThrow(
                error,
            );
        });
    });
});
