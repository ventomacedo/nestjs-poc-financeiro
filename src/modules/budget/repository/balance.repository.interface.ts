import { CancelReserveRequestDto } from './../dto/cancel-reserve-request.dto';
import { Balance as BalanceType } from '@prisma';
import { ReserveBalanceRequestDto } from '../dto/reserve-balance-request.dto';
import { DoneRequestDto } from '../dto/done-request.dto';

export type Balance = BalanceType;
export const BALANCE_REPOSITORY = Symbol('BALANCE_REPOSITORY');

export interface IBalanceRepositoryInterface {
    find(userId): Promise<Balance | null>;
    reserve(userId: string, data: ReserveBalanceRequestDto): Promise<Balance>;
    cancel(userId: string, data: CancelReserveRequestDto): Promise<Balance>;
    done(userId: string, data: DoneRequestDto): Promise<Balance>;
}
