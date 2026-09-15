import { PrismaService } from '@database';
import { IProductsInterface, Products } from './products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductsRepository implements IProductsInterface {
    constructor(private readonly db: PrismaService) {}

    public async find(take: number, cursorId: string): Promise<Products[]> {
        return await this.db.products.findMany({
            take: take,
            skip: cursorId ? 1 : 0,
            cursor: cursorId ? { id: cursorId } : undefined,
            orderBy: { id: 'asc' },
        });
    }

    public async findById(productId: any): Promise<Products | null> {
        return await this.db.products.findUnique({
            where: { id: productId },
        });
    }

    public async findByName(name: any): Promise<Products[]> {
        return await this.db.products.findMany({ where: { name } });
    }

    // FullIndex Text
    public async search(terms: string): Promise<Products[]> {
        return await this.db.$queryRaw`
            SELECT
                id, name, description, price, status,
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM products
                WHERE "searchVector" @@ websearch_to_tsquery('portuguese', ${terms})
            ORDER BY ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) DESC`;
    }

    public async create(data: Products): Promise<Products> {
        return await this.db.products.create({
            data: { ...data },
        });
    }

    public async update(id: string, data: Products): Promise<Products | null> {
        return await this.db.products.update({
            where: { id },
            data: { ...data },
        });
    }

    public async delete(id: string): Promise<void> {
        await this.db.products.delete({ where: { id } });
    }
}
