import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BalanceService } from './balance.service';
import { LedgerService } from './ledger.service';
import { BALANCE_REPOSITORY } from './repository/balance.repository.interface';
import { PrismaBalanceRepository } from './repository/prisma-balance.repository';
import { LEDGER_REPOSITORY } from './repository/ledger.repository.interface';
import { PrismaLedgerRepository } from './repository/prisma-ledger.repository';

@Module({
    imports: [],
    controllers: [BudgetController],
    providers: [
        BudgetService,
        BalanceService,
        LedgerService,
        { provide: BALANCE_REPOSITORY, useClass: PrismaBalanceRepository },
        { provide: LEDGER_REPOSITORY, useClass: PrismaLedgerRepository },
    ],
    exports: [],
})
export class BudgetModules {}
