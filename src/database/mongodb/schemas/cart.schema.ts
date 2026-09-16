import mongoose, { Schema, Document } from 'mongoose';
import { uuidv7 } from 'uuidv7';

export interface ICartItem {
    productId: string;
    quantity: number;
    price: number;
    addedAt?: Date;
}

export interface ICart extends Document<mongoose.Types.UUID> {
    userId: string;
    items: ICartItem[] | null;
    status: 'Active' | 'Inactive';
    createdAt: Date;
    updatedAt?: Date | null;
}

export const CartSchema: Schema<ICart> = new Schema<ICart>(
    {
        _id: {
            type: Schema.Types.UUID,
            default: () => new mongoose.Types.UUID(uuidv7()),
        },
        userId: { type: String, required: true, unique: true, index: true },
        items: [
            {
                productId: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
                addedAt: { type: Date, default: Date.now },
            },
        ],
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    { timestamps: true },
);

CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 120 }); // Expira em 6 meses.
