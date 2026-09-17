import { Model } from 'mongoose';
import { ICart, ICartRepository } from './cart.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICartItem } from 'database/mongodb/schemas';
import { RemoveFromCartRequestDto } from '../dto/remove-cart-request.dto';

@Injectable()
export class MongoDbCartRepository implements ICartRepository {
    constructor(@InjectModel('Cart') private readonly db: Model<ICart>) {}

    public async list(userId: string): Promise<ICart | null> {
        return await this.db.findOne({ userId }).lean();
    }

    public async create(userId: string): Promise<ICart> {
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

    public async addItem(userId: string, item: ICartItem): Promise<ICart> {
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
        userId: string,
        item: RemoveFromCartRequestDto,
    ): Promise<ICart | null> {
        await this.db.findOneAndUpdate(
            { userId, 'items.productId': item.productId },
            {
                $inc: { 'items.$.quantity': -item.quantity },
                $set: { updatedAt: new Date() },
            },
        );

        return await this.db.findOneAndUpdate(
            { userId },
            { $pull: { items: { quantity: { $lte: 0 } } } },
            { new: true },
        );
    }

    public async clear(userId: string): Promise<void> {
        await this.db.findOneAndUpdate(
            { userId },
            { $set: { items: [], updatedAt: new Date() } },
        );
    }
}
