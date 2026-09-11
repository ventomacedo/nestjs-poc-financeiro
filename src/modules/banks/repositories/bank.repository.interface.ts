import { Bank as BankType } from '@prisma';
import { CreateBankRequestDto } from '../dto/create-bank-request.dto';
import { UpdateBankRequestDto } from '../dto/update-bank-request.dto';

export type Bank = BankType;
export const BANK_REPOSITORY = Symbol('BANK_REPOSITORY');

export interface IBankRepository {
    findAll(): Promise<Bank[]>;
    find(id: string): Promise<Bank | []>;
    create(data: CreateBankRequestDto): Promise<Bank>;
    update(id: string, data: UpdateBankRequestDto): Promise<Bank | null>;
    delete(id: string): Promise<Bank>;
}
