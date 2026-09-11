import { Inject, Injectable } from '@nestjs/common';
import {
    catchError,
    distinctUntilChanged,
    from,
    of,
    switchMap,
    timer,
} from 'rxjs';
import {
    type Ledger,
    LEDGER_REPOSITORY,
    type ILedgerRepositoryInterface,
} from './repository/ledger.repository.interface';
import {
    BALANCE_REPOSITORY,
    type IBalanceRepositoryInterface,
} from './repository/balance.repository.interface';

@Injectable()
export class LedgerService {
    constructor(
        @Inject(LEDGER_REPOSITORY)
        private readonly ledger: ILedgerRepositoryInterface,
        @Inject(BALANCE_REPOSITORY)
        private readonly balance: IBalanceRepositoryInterface,
    ) {}

    public pollerLedger(userId: string) {
        return timer(0, 5000).pipe(
            switchMap(() =>
                from(this.ledger.findPending(userId)).pipe(
                    switchMap(async (data) => {
                        if (data.length)
                            await this.ledger.update(data.map((d) => d.id));

                        const balance = await this.balance.find(userId);
                        return { data: { ...balance } };
                    }),
                    catchError((error) => {
                        console.error(error);
                        return of({ data: { error: 'Banco indisponível.' } });
                    }),
                ),
            ),
            distinctUntilChanged(
                (prev, next) => prev === next,
                (item) =>
                    'version' in item.data
                        ? String(item.data.version)
                        : item.data,
            ),
        );
    }

    public async getLeader(userId: string): Promise<Ledger[]> {
        return await this.ledger.findAll(userId);
    }
}
