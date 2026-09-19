import { ProductsService } from './products.service';
import { JwthGuard } from '@auth';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SearchProductsRequestDto } from './dto/search-products-request.dto';
import { FindProductsRequestDto } from './dto/find-products-request.dto';
import { SearchProductsResponseDto } from './dto/search-products-response.dto';
import { FindProductsResponseDto } from './dto/find-products-response.dto';
import { CreateProductsRequestDto } from './dto/create-products-request.dto';
import { UpdateProductsRequestDto } from './dto/update-products-request.dto';

@Controller('/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('/')
    @UseGuards(JwthGuard)
    public async products(
        @Query() body: FindProductsRequestDto,
    ): Promise<FindProductsResponseDto> {
        return await this.productsService.find(
            body.pageSize ?? 10,
            body.pageToken,
        );
    }

    @Get('/search')
    @UseGuards(JwthGuard)
    public async searchProduct(
        @Query() body: SearchProductsRequestDto,
    ): Promise<SearchProductsResponseDto> {
        return await this.productsService.search(body);
    }

    @Get('/:slug')
    @UseGuards(JwthGuard)
    public async getProductBySlug(@Param('slug') slug: string) {
        return await this.productsService.findBySlug(slug);
    }

    @Post('/')
    @UseGuards(JwthGuard)
    public async createProduct(@Body() body: CreateProductsRequestDto) {
        return await this.productsService.create(body);
    }

    @Put('/:id')
    @UseGuards(JwthGuard)
    public async updateProduct(
        @Param('id') id: string,
        @Body() body: UpdateProductsRequestDto,
    ) {
        return await this.productsService.update(id, body);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(JwthGuard)
    public async deleteProduct(@Param('id') id: string) {
        return await this.productsService.delete(id);
    }
}
