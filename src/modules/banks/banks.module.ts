import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { Module } from '@nestjs/common';
import { BANK_REPOSITORY } from './repositories/bank.repository.interface';
import { PrismaBankRepository } from './repositories/prisma-bank.repository';

@Module({
    imports: [],
    controllers: [BanksController],
    providers: [
        BanksService,
        { provide: BANK_REPOSITORY, useClass: PrismaBankRepository },
    ],
    exports: [],
})
export class BanksModule {}
