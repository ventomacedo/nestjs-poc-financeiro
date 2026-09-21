import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    IProductsRepository,
    Product,
    PRODUCTS_REPOSITORY,
} from './repository/products.repository';
import { FindProductsResponseDto } from './dto/find-products-response.dto';
import { SearchProductsRequestDto } from './dto/search-products-request.dto';
import {
    productStatusMapping,
    SearchProductsResponseDto,
} from './dto/search-products-response.dto';
import { CreateProductsRequestDto } from './dto/create-products-request.dto';
import { slugfy } from '@shared/utils';
import { UpdateProductsRequestDto } from './dto/update-products-request.dto';

@Injectable()
export class ProductsService {
    // private logger = new Logger(ProductsService.name);

    constructor(
        @Inject(PRODUCTS_REPOSITORY)
        private readonly products: IProductsRepository,
    ) {}

    public async find(
        limit: number,
        pageToken?: string,
    ): Promise<FindProductsResponseDto> {
        const cursorId = !!pageToken
            ? Buffer.from(pageToken, 'base64').toString('ascii')
            : undefined;

        const result = await this.products.list(limit, cursorId);
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

        // this.logger.debug({ message: `new pageToke: ${nextPageToken}` });
        return { data, pageToken: nextPageToken };
    }

    public async findBySlug(slug: string): Promise<Product | null> {
        return await this.products.getBySlug(slug);
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
    ): Promise<Product | null> {
        const slug = !data.slug ? slugfy(data.name) : data.slug;
        return await this.products.create({ ...data, slug });
    }

    public async update(
        id,
        data: UpdateProductsRequestDto,
    ): Promise<Product | null> {
        return await this.products.update(id, data);
    }

    public async delete(id: string): Promise<void> {
        await this.products.delete(id);
    }
}
