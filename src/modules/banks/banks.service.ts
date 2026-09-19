import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBankRequestDto } from './dto/update-bank-request.dto';

import {
    type Bank,
    BANK_REPOSITORY,
    type IBankRepository,
} from './repositories/bank.repository.interface';
import axios from 'axios';
import { UseCircuitBrake } from 'shared/decorators/circuit-braker.decorator';
import { delay } from '@shared/utils';

@Injectable()
export class BanksService {
    private readonly logger = new Logger(BanksService.name);

    constructor(
        @Inject(BANK_REPOSITORY) private readonly banks: IBankRepository,
    ) {}

    public async getBanks(): Promise<Bank[]> {
        const data = await this.banks.findAll();
        return data as Bank[];
    }

    public async findBankById(id: string): Promise<Bank | null> {
        const bank = await this.banks.find(id);
        return bank as Bank;
    }

    public async createBank(
        data: CreateBankRequestDto,
    ): Promise<CreateBanksResponseDto> {
        const newBank = await this.banks.create(data);
        return newBank;
    }

    public async updateBank(
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

    public async deleteBank(id: string): Promise<void> {
        const result = await this.banks.delete(id);

        if (!result.id)
            throw new NotFoundException(
                `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
            );
    }

    @UseCircuitBrake({
        timeout: 3000,
        errorThresholdPercentage: 50,
        volumeThreshold: 5, // mínimo de chamadas na janela antes de poder abrir
        resetTimeout: 5000, // OPEN -> HALF-OPEN após 5s
        fallback: '_fallbackTest',
    })
    public async callGateway(status: number): Promise<number> {
        const res = await axios.get(`https://httpbin.org/status/${status}`);
        return res.status;
    }

    public async testCircuitBraker(): Promise<void> {
        const call = async (label: string, status: number) => {
            try {
                console.log(label, await this.callGateway(status));
            } catch (err: any) {
                console.error(label, 'FALHA:', err.message);
            }
            await delay(500);
        };

        // CLOSED: sucessos
        for (let i = 1; i <= 3; i++) await call(`[CLOSED] #${i}`, 200);
        // Falhas até o % de erro passar o limite -> evento 'open'
        for (let i = 1; i <= 6; i++) await call(`[FALHANDO] #${i}`, 500);
        // OPEN: chamadas nem chegam ao gateway, respondem pelo fallback
        for (let i = 1; i <= 3; i++) await call(`[OPEN] #${i}`, 200);
        // Aguarda resetTimeout -> evento 'halfOpen'
        await delay(5500);
        // HALF-OPEN: chamada de prova com sucesso -> evento 'close'
        await call('[HALF-OPEN] prova', 200);
        // CLOSED novamente
        for (let i = 1; i <= 2; i++) await call(`[CLOSED again] #${i}`, 200);
    }

    private async _fallbackTest(status: number, err: Error) {
        this.logger.warn(`Fallback (status=${status}): ${err?.message}`);
        return { status, error: err.message };
    }
}
