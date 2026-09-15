import { PrismaService } from '@database';
import { IProductsInterface, Products } from './products.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus as ProductStatusEnum } from '@prisma';
import { CreateProductsRequestDto } from '../dto/create-products-request.dto';

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

    public async findBySlug(slug: string): Promise<Products | null> {
        return await this.db.products.findUnique({ where: { slug } });
    }

    // FullIndex Text
    public async search({ terms, pageSize, lastRank, lastId }): Promise<any[]> {
        const hasCursor =
            lastRank !== null &&
            lastRank !== undefined &&
            lastId !== null &&
            lastId !== undefined;

        const cursorCondition = hasCursor
            ? Prisma.sql`AND (
                ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) < ${lastRank}
                OR (
                    ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) = ${lastRank}
                    AND id > ${lastId}
                )
            )`
            : Prisma.empty;

        return await this.db.$queryRaw`
            SELECT
                id, name, description, price, status, slug,
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt",
                ts_rank("searchVector", websearch_to_tsquery('portuguese', ${terms})) as rank
            FROM products
                WHERE "searchVector" @@ websearch_to_tsquery('portuguese', ${terms})
                ${cursorCondition}
                AND deleted_at IS NULL
            ORDER BY rank DESC, id ASC
            LIMIT ${pageSize}`;
    }

    public async create(data: CreateProductsRequestDto): Promise<Products> {
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

export type ProductStatus = ProductStatusEnum;
