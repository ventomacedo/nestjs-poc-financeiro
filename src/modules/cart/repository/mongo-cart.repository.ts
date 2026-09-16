import { Model } from 'mongoose';
import { ICartRepository } from './cart.repository.interface';
import {
    ICartItem as CartItemInterface,
    ICart as CartInterface,
} from 'database/mongodb/schemas';
import { Injectable } from '@nestjs/common';

export type ICart = CartInterface;
export type ICartItem = CartItemInterface;

@Injectable()
export class CartRepository implements ICartRepository {
    constructor(private readonly db: Model<CartInterface>) {}

    public async list(userId: string): Promise<CartInterface | null> {
        return await this.db.findOne({ userId }).lean();
    }

    public async create(userId: string): Promise<CartInterface> {
        const _cart = {
            userId,
            items: [],
            status: 'Active' as const,
            createdAt: new Date(),
        };

        const existing = await this.db.findOne({ userId: userId });
        if (existing)
            await this.db.findByIdAndUpdate(existing._id, _cart, { new: true });

        return await this.db.create(_cart);
    }

    public async addItem(
        userId: string,
        item: CartItemInterface,
    ): Promise<CartInterface> {
        return await this.db.findOneAndUpdate(
            { userId },
            {
                $push: {
                    items: {
                        ...item,
                        addedAt: new Date(),
                    },
                },
            },
            { new: true, upsert: true },
        );
    }

    public async removeItem(
        userId,
        item: CartItemInterface,
    ): Promise<CartInterface | null> {
        return await this.db.findOneAndUpdate(
            { userId },
            {
                $pull: { items: [item.productId] },
                $set: { updatedAt: new Date() },
            },
        );
    }

    public async clear(userId): Promise<void> {
        await this.db.findOneAndUpdate(
            { userId },
            { $set: { items: [], updatedAt: new Date() } },
        );
    }
}
