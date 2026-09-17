import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwthGuard } from '@auth';
import { User } from '@shared/decorators';
import { AddToCartRequestDto } from './dto/add-cart-request.dto';
import { RemoveFromCartRequestDto } from './dto/remove-cart-request.dto';

@Controller('/cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get('/')
    @UseGuards(JwthGuard)
    public async getCart(@User() user: any) {
        return await this.cartService.getCart(user.userId);
    }

    @Post('/')
    @UseGuards(JwthGuard)
    public async addItem(@User() user: any, @Body() body: AddToCartRequestDto) {
        return await this.cartService.addToCart(user.userId, body);
    }

    @Delete('/')
    @UseGuards(JwthGuard)
    public async removeItem(
        @User() user: any,
        @Body() body: RemoveFromCartRequestDto,
    ) {
        return await this.cartService.removeFromCart(user.userId, body);
    }

    @Get('/clear')
    @UseGuards(JwthGuard)
    public async clearCart(@User() user: any) {
        return await this.cartService.clearCart(user.userId);
    }
}
