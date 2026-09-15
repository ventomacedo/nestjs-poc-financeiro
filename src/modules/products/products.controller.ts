import { ProductsService } from './products.service';
import { JwthGuard } from '@auth';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchProductsRequestDto } from './dto/search-products-request.dto';

@Controller('/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('/')
    @UseGuards(JwthGuard)
    public async products() {
        return await this.productsService.find();
    }

    @Get('/search')
    @UseGuards(JwthGuard)
    public async searchProduct(@Query() query: SearchProductsRequestDto) {
        return await this.productsService.search(query.terms);
    }
}
