import { Controller, Delete, Get, Post } from '@nestjs/common';

@Controller('/cart')
export class CartController {
    constructor() {}

    @Get('/')
    public async getCart() {
        return {};
    }

    @Post('/')
    public async addItem() {
        return {};
    }

    @Delete('/')
    public async removeItem() {
        return {};
    }
}
