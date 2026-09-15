import { Products as ProductsType } from '@prisma';

export type Products = ProductsType;
export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');

export interface IProductsInterface {
    find(take: number, cursorId: string | undefined): Promise<Products[]>;
    findById(productId: string): Promise<Products | null>;
    findByName(name: string): Promise<Products[]>;
    search(terms: string): Promise<Products[]>;

    create(data: Products): Promise<Products>;
    update(id: string, data: Products): Promise<Products | null>;
    delete(id: string): Promise<void>;
}
