import { Inject, Injectable } from '@nestjs/common';
import {
    type IProductsInterface,
    PRODUCTS_REPOSITORY,
    type Products,
} from './repository/products.repository';
import {
    FindProductsResponseDto,
    productStatusMapping,
} from './dto/find-products-response.dto';
import { SearchProductsRequestDto } from './dto/search-products-request.dto';
import { SearchProductsResponseDto } from './dto/search-products-response.dto';
import { CreateProductsRequestDto } from './dto/create-products-request.dto';
import { slugfy } from '@shared/utils';
import { UpdateProductsRequestDto } from './dto/update-products-request.dto';

@Injectable()
export class ProductsService {
    constructor(
        @Inject(PRODUCTS_REPOSITORY)
        private readonly products: IProductsInterface,
    ) {}

    public async find(
        limit: number,
        pageToken?: string,
    ): Promise<FindProductsResponseDto> {
        const cursorId = !!pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : undefined;

        const result = await this.products.find(limit, cursorId);
        const data = result.map((item) => ({
            ...item,
            displayStatus: productStatusMapping[item.status],
        }));

        let nextPageToken: string | null = null;

        if (data.length === limit) {
            const lastItem = data.at(-1);
            nextPageToken = !!lastItem
                ? Buffer.from(lastItem.id).toString('base64')
                : null;
        }

        return { data, pageToken: nextPageToken };
    }

    public async findBySlug(id: string): Promise<Products | null> {
        return await this.products.findBySlug(id);
    }

    public async search(
        dto: SearchProductsRequestDto,
    ): Promise<SearchProductsResponseDto> {
        const { terms, pageToken, pageSize } = dto;
        const _limit = pageSize ?? 10;

        const pageTokenDecoded = pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : '';

        const [lastRank, lastId] = pageToken
            ? pageTokenDecoded.split(',')
            : [null, null];

        const data = await this.products.search({
            terms,
            pageSize: _limit,
            lastRank: !!lastRank ? Number(lastRank) : undefined,
            lastId: !!lastId ? String(lastId) : undefined,
        });

        let nextToken: string | null = null;
        if (data.length === _limit) {
            const lastItem = data.at(-1);
            nextToken = Buffer.from(`${lastItem.rank},${lastItem.id}`).toString(
                'base64',
            );
        }

        return { data, pageToken: nextToken };
    }

    public async create(
        data: CreateProductsRequestDto,
    ): Promise<Products | null> {
        const slug = !data.slug ? slugfy(data.name) : data.slug;
        return await this.products.create({ ...data, slug });
    }

    public async update(
        id,
        data: UpdateProductsRequestDto,
    ): Promise<Products | null> {
        return await this.products.update(id, data);
    }

    public async delete(id: string): Promise<void> {
        await this.products.delete(id);
    }
}
