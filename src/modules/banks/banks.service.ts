import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBankRequestDto } from './dto/update-bank-request.dto';

import {
    type Bank,
    BANK_REPOSITORY,
    type IBankRepository,
} from './repositories/bank.repository.interface';
@Injectable()
export class BanksService {
    constructor(
        @Inject(BANK_REPOSITORY) private readonly banks: IBankRepository,
    ) {}

    async getBanks(): Promise<Bank[]> {
        const data = await this.banks.findAll();
        return data as Bank[];
    }

    async findBankById(id: string): Promise<Bank | null> {
        const bank = await this.banks.find(id);
        return bank as Bank;
    }

    async createBank(
        data: CreateBankRequestDto,
    ): Promise<CreateBanksResponseDto> {
        const newBank = await this.banks.create(data);
        return newBank;
    }

    async updateBank(
        data: UpdateBankRequestDto,
        id: string,
    ): Promise<CreateBanksResponseDto> {
        const updatedBank = await this.banks.update(id, data);

        if (!updatedBank?.id)
            throw new NotFoundException(
                `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
            );

        return updatedBank;
    }

    async deleteBank(id: string): Promise<void> {
        const result = await this.banks.delete(id);

        if (!result.id)
            throw new NotFoundException(
                `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
            );
    }
}
