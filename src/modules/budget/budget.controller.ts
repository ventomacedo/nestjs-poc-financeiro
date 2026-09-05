import { JwthGuard } from '@auth';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Header,
    Post,
    Sse,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { User } from '@shared/decorators';
import { BudgetService } from './budget.service';
import { ReserveBalanceRequestDto } from './dto/reserve-balance-request.dto';
import { IdempotencyInterceptor } from './budget.interceptor';
import { DoneTrasactionRequestDto } from './dto/done-transaction-request.dto';
import { CancelReserveRequestDto } from './dto/cancel-reserve-request.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { filter, map } from 'rxjs/operators';

@Controller('budget')
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) {}

    @UseGuards(JwthGuard)
    @Get('/balance')
    public async getBalance(@User() user: any) {
        return await this.budgetService.getBalance(user.userId);
    }

    @UseGuards(JwthGuard)
    @Get('/ledger')
    @UseInterceptors(ClassSerializerInterceptor)
    public async getLedger(@User() user: any): Promise<LedgerResponseDto[]> {
        const data = await this.budgetService.getLeader(user.userId);
        return data.map((item) => new LedgerResponseDto(item));
    }

    @UseGuards(JwthGuard)
    @Post('/reserve')
    @UseInterceptors(IdempotencyInterceptor)
    public async reserveBalance(
        @User() user: any,
        @Body() body: ReserveBalanceRequestDto,
    ) {
        const response = await this.budgetService.reserveBalance(
            user.userId,
            body,
        );
        return { ...response };
    }

    @UseGuards(JwthGuard)
    @Post('/cancel')
    @UseInterceptors(IdempotencyInterceptor)
    public async cancelReserve(
        @User() user: any,
        @Body() body: CancelReserveRequestDto,
    ) {
        const response = await this.budgetService.cancelReserve(
            user.userId,
            body,
        );
        return { ...response };
    }

    @UseGuards(JwthGuard)
    @Post('/confirm')
    @UseInterceptors(IdempotencyInterceptor)
    public async confirmaTransaction(
        @User() user: any,
        @Body() body: DoneTrasactionRequestDto,
    ) {
        await this.budgetService.doneTransaction(
            user.userId,
            body.orderId,
            body.version,
        );
    }

    @UseGuards(JwthGuard)
    @Header('Content-Type', 'text/event-stream')
    @Header('Cache-Control', 'no-cache')
    @Header('Connection', 'keep-alive')
    @Sse('/balance/stream')
    public async balanceStream(@User() user: any) {
        return this.budgetService.getNotificationStream().pipe(
            map((payload) => ({ data: payload }) as MessageEvent),
            filter((item) => item.data.user_id === user.userId),
        );
    }
}
