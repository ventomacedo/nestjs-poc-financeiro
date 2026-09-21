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
import { decode64, encode64, slugfy } from '@shared/utils';
import { UpdateProductsRequestDto } from './dto/update-products-request.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
    private logger = new Logger(ProductsService.name);

    constructor(
        @Inject(PRODUCTS_REPOSITORY)
        private readonly products: IProductsRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    private static readonly LIST_VERSION_KEY = 'products:list:version';
    private static readonly LIST_TTL_MS = 60 * 60 * 1000;

    private async listKey(limit: number, pageToken?: string): Promise<string> {
        const version =
            (await this.cacheManager.get<number>(
                ProductsService.LIST_VERSION_KEY,
            )) ?? 0;
        return `products:list:v${version}:${limit}:${pageToken ?? 'first'}`;
    }

    private async invalidateList(): Promise<void> {
        const version =
            (await this.cacheManager.get<number>(
                ProductsService.LIST_VERSION_KEY,
            )) ?? 0;
        await this.cacheManager.set(
            ProductsService.LIST_VERSION_KEY,
            version + 1,
            0,
        );
    }

    public async find(
        limit: number,
        pageToken: string = '',
    ): Promise<FindProductsResponseDto> {
        const key = await this.listKey(limit, pageToken);
        const cached =
            await this.cacheManager.get<FindProductsResponseDto>(key);
        if (cached) {
            this.logger.debug(`Data from cache: ${key}`);
            return cached;
        }

        const cursorId = decode64(pageToken);

        const result = await this.products.list(limit, cursorId);
        const data = result.map((item) => ({
            ...item,
            displayStatus: productStatusMapping[item.status],
        }));

        let nextPageToken: string | null = null;

        if (data.length === limit) {
            const lastItem = data.at(-1);
            nextPageToken = encode64(lastItem?.id ?? '');
        }

        const response = { data, pageToken: nextPageToken };
        await this.cacheManager.set(key, response, ProductsService.LIST_TTL_MS);
        return response;
    }

    public async findBySlug(slug: string): Promise<Product | null> {
        return await this.products.getBySlug(slug);
    }

    public async search(
        dto: SearchProductsRequestDto,
    ): Promise<SearchProductsResponseDto> {
        const { terms, pageToken, pageSize } = dto;
        const _limit = pageSize ?? 10;

        const pageTokenDecoded = pageToken ? decode64(pageToken) : '';

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
        const created = await this.products.create({ ...data, slug });
        await this.invalidateList();
        return created;
    }

    public async update(
        id,
        data: UpdateProductsRequestDto,
    ): Promise<Product | null> {
        const updated = await this.products.update(id, data);
        await this.invalidateList();
        return updated;
    }

    public async delete(id: string): Promise<void> {
        await this.products.delete(id);
        await this.invalidateList();
    }
}
