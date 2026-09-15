import { Products as ProductsType } from '@prisma';
import { CreateProductsRequestDto } from '../dto/create-products-request.dto';
import { UpdateProductsRequestDto } from '../dto/update-products-request.dto';

export type Products = ProductsType;
export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');

export interface IProductsInterface {
    find(take: number, cursorId: string | undefined): Promise<Products[]>;
    findBySlug(slug: string): Promise<Products | null>;
    search(params: {
        terms: string;
        pageSize: number;
        lastRank?: number | null;
        lastId?: string | null;
    }): Promise<any[]>;

    create(data: CreateProductsRequestDto): Promise<Products>;
    update(
        id: string,
        data: UpdateProductsRequestDto,
    ): Promise<Products | null>;
    delete(id: string): Promise<void>;
}
