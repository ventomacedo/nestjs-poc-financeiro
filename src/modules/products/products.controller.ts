import { ProductsService } from './products.service';
import { JwthGuard } from '@auth';
import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { SearchProductsRequestDto } from './dto/search-products-request.dto';
import { FindProductsRequestDto } from './dto/find-products-request.dto';

@Controller('/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('/')
    @UseGuards(JwthGuard)
    public async products(@Body() body: FindProductsRequestDto) {
        return await this.productsService.find(
            body.pageSize ?? 10,
            body.pageToken,
        );
    }

    @Get('/search')
    @UseGuards(JwthGuard)
    public async searchProduct(@Body() body: SearchProductsRequestDto) {
        return await this.productsService.search(body.terms);
    }
}
