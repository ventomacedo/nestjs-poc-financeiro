import { Injectable } from '@nestjs/common';
import { IBankRepository } from './bank.repository.interface';
import { PrismaService } from '@database';
import { Bank } from '@prisma';
import { CreateBankRequestDto } from '../dto/create-bank-request.dto';
import { UpdateBankRequestDto } from '../dto/update-bank-request.dto';

@Injectable()
export class PrismaBankRepository implements IBankRepository {
    constructor(private readonly db: PrismaService) {}

    public async create(data: CreateBankRequestDto): Promise<Bank> {
        return await this.db.bank.create({ data: { ...data } });
    }

    public async update(
        id: string,
        data: UpdateBankRequestDto,
    ): Promise<Bank | null> {
        return await this.db.bank.update({ where: { id }, data: { ...data } });
    }

    public async delete(id: string): Promise<Bank> {
        return (await this.db.bank.delete({
            where: { id },
            select: { id: true },
        })) as Bank;
    }
    public async findAll(): Promise<Bank[]> {
        return await this.db.bank.findMany();
    }

    public async find(id: string): Promise<Bank | []> {
        return (await this.db.bank.findFirst({ where: { id } })) as Bank;
    }
}
