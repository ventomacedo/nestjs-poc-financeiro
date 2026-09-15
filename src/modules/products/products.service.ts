import { Inject, Injectable } from '@nestjs/common';
import {
    type IProductsInterface,
    PRODUCTS_REPOSITORY,
    type Products,
} from './repository/products.repository';

@Injectable()
export class ProductsService {
    constructor(
        @Inject(PRODUCTS_REPOSITORY)
        private readonly products: IProductsInterface,
    ) {}

    public async find(): Promise<Products[]> {
        return await this.products.find();
    }

    public async findById(id: string): Promise<Products | null> {
        return await this.products.findById(id);
    }

    public async search(terms: string): Promise<Products[]> {
        return await this.products.search(terms);
    }
}
