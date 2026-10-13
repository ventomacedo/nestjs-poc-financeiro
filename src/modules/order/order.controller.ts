import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { JwthGuard } from '@auth';
import { User, IdempotencyInterceptor } from '@shared';
import { OrderService } from './order.service';
import { CheckoutRequestDto } from './dto/checkout-request.dto';

@Controller('/order')
@UseGuards(JwthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('/')
    public async findAll(@User() user: any) {
        return await this.orderService.findAll(user.userId);
    }

    @Get('/:id')
    public async findOne(@User() user: any, @Param('id') id: string) {
        return await this.orderService.findOne(user.userId, id);
    }

    @Post('/checkout')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseInterceptors(IdempotencyInterceptor)
    public async checkout(
        @User() user: any,
        @Headers('x-transaction-id') transactionId: string,
        @Body() body: CheckoutRequestDto,
    ) {
        return await this.orderService.checkout(
            user.userId,
            transactionId,
            body,
        );
    }

    @Post('/:id/confirm')
    public async confirm(@User() user: any, @Param('id') id: string) {
        return await this.orderService.confirm(user.userId, id);
    }

    @Post('/:id/cancel')
    public async cancel(@User() user: any, @Param('id') id: string) {
        return await this.orderService.cancel(user.userId, id);
    }
}
