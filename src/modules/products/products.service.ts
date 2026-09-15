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

    public async find(limit: number, pageToken?: string): Promise<any> {
        const cursorId = !!pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : undefined;

        const data = await this.products.find(limit, cursorId);

        let nextPageToken: string | null = null;

        if (data.length === limit) {
            const lastItem = data.at(-1);
            nextPageToken = !!lastItem
                ? Buffer.from(lastItem.id).toString('base64')
                : null;
        }

        return { data, pageToken: nextPageToken };
    }

    public async findById(id: string): Promise<Products | null> {
        return await this.products.findById(id);
    }

    public async search(terms: string): Promise<Products[]> {
        return await this.products.search(terms);
    }
}
