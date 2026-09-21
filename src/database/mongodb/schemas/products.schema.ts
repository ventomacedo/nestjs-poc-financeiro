import { ProductStatus } from 'modules/products/repository/prisma-products.repository';
import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

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
        description: { type: String, required: true },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    { timestamps: true },
);
