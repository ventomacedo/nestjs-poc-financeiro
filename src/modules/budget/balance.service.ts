import { Inject, Injectable } from '@nestjs/common';
import {
    type Balance,
    BALANCE_REPOSITORY,
    type IBalanceRepositoryInterface,
} from './repository/balance.repository.interface';
import { ReserveBalanceRequestDto } from './dto/reserve-balance-request.dto';
import { CancelReserveRequestDto } from './dto/cancel-reserve-request.dto';
import { DoneRequestDto } from './dto/done-request.dto';

@Injectable()
export class BalanceService {
    constructor(
        @Inject(BALANCE_REPOSITORY)
        private readonly balanceService: IBalanceRepositoryInterface,
    ) {}

    public async getBalance(userId: string): Promise<Balance | null> {
        const balance = await this.balanceService.find(userId);
        return balance;
    }

    public async reserve(
        userId: string,
        data: ReserveBalanceRequestDto,
    ): Promise<Balance> {
        return await this.balanceService.reserve(userId, data);
    }

    public async cancel(
        userId: string,
        data: CancelReserveRequestDto,
    ): Promise<Balance> {
        return await this.balanceService.cancel(userId, data);
    }

    public async done(
        userId: string,
        data: DoneRequestDto,
    ): Promise<Balance | null> {
        return await this.balanceService.done(userId, data);
    }
}
