import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export enum ProductStatus {
    IN_STOCK = 'IN_STOCK',
    OUT_STOCK = 'OUT_STOCK',
}

export interface IProduct extends Document<mongoose.Types.UUID> {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date | null;
}

export const ProductsSchema: Schema<IProduct> = new Schema<IProduct>(
    {
        _id: {
            type: Schema.Types.UUID,
            default: () => new mongoose.Types.UUID(uuidv7()),
        },
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(ProductStatus),
            default: ProductStatus.IN_STOCK,
        },
    },
    { timestamps: true },
);

ProductsSchema.index(
    { title: 'text', description: 'text' },
    { weights: { name: 10, description: 9 }, default_language: 'portuguese' },
);
