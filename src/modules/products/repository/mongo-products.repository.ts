import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IProduct } from 'database/mongodb/schemas/products.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateProductsRequestDto } from '../dto/create-products-request.dto';
import { UpdateProductsRequestDto } from '../dto/update-products-request.dto';
import { IProductsRepository } from './products.repository';
import { ProductStatus as ProductStatusEnum } from 'database/mongodb/schemas/products.schema';

export const productStatusMapping = {
    IN_STOCK: 'Em estoque',
    OUT_STOCK: 'Fora de estoque',
    AVAILABLE: 'Disponível',
    UNAVAILABLE: 'Indisponível',
};

@Injectable()
export class MongoDBProductsRepository implements IProductsRepository {
    constructor(
        @InjectModel('Products') private readonly db: Model<IProduct>,
    ) {}

    public async list(limit: number, lastId?: string): Promise<IProduct[]> {
        // Schema UUID não aceita $lt/$gt no cast; $expr ignora o cast do schema.
        const filter = lastId
            ? { $expr: { $gt: ['$_id', new mongoose.Types.UUID(lastId)] } }
            : {};

        const docs = await this.db
            .find(filter)
            .sort({ _id: 1 })
            .limit(limit)
            .lean();

        return docs.map((doc) => ({
            ...doc,
            id: doc._id.toString(),
        })) as unknown as IProduct[];
    }

    public async getBySlug(slug: string): Promise<IProduct | null> {
        return await this.db.findOne({ slug }).lean();
    }

    public async search(params: {
        terms: string;
        pageSize: number;
        lastRank?: number | null;
        lastId?: string | null;
    }): Promise<any[]> {
        const { terms, pageSize, lastRank, lastId } = params;

        // Ordem é (rank DESC, _id ASC), então o cursor precisa comparar os dois.
        // $meta textScore não é filtrável no find(); por isso aggregate.
        const cursor =
            lastRank != null && lastId
                ? [
                      {
                          $match: {
                              $or: [
                                  { rank: { $lt: lastRank } },
                                  {
                                      rank: lastRank,
                                      _id: {
                                          $gt: new mongoose.Types.UUID(lastId),
                                      },
                                  },
                              ],
                          },
                      },
                  ]
                : [];

        const docs = await this.db.aggregate([
            { $match: { $text: { $search: terms } } },
            { $addFields: { rank: { $meta: 'textScore' } } },
            ...cursor,
            { $sort: { rank: -1, _id: 1 } },
            { $limit: pageSize },
        ]);

        return docs.map((doc) => ({
            ...doc,
            id: doc._id.toUUID().toString(),
        }));
    }

    public async create(data: CreateProductsRequestDto): Promise<IProduct> {
        const _product = { ...data };
        const _existing = await this.db.findOne({ slug: _product.slug });
        if (_existing)
            await this.db.findByIdAndUpdate(_existing._id, _product, {
                new: true,
            });

        return await this.db.create(_product);
    }

    public async update(
        id: string,
        data: UpdateProductsRequestDto,
    ): Promise<IProduct | null> {
        return await this.db
            .findByIdAndUpdate(id, { ...data }, { new: true })
            .lean();
    }

    public async delete(_id: string): Promise<any> {
        return await this.db.deleteOne({ _id: new Types.UUID(_id) });
    }
}

export type ProductStatus = ProductStatusEnum;
