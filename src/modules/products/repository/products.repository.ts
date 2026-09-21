import { IProduct } from 'database/mongodb/schemas/products.schema';
import { CreateProductsRequestDto } from '../dto/create-products-request.dto';
import { UpdateProductsRequestDto } from '../dto/update-products-request.dto';

export type Products = IProduct[];
export type Product = IProduct;
export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');
export interface IProductsRepository {
    list(limit: number, lastId?: string): Promise<Products>;
    getBySlug(slug: string): Promise<Product | null>;
    search(params: {
        terms: string;
        pageSize: number;
        lastRank?: number | null;
        lastId?: string | null;
    }): Promise<any[]>;

    create(data: CreateProductsRequestDto): Promise<Product>;
    update(id: string, data: UpdateProductsRequestDto): Promise<Product | null>;
    delete(id: string): Promise<void>;
}
