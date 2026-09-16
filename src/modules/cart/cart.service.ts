import { Injectable } from '@nestjs/common';
import { ICartRepository } from './repository/cart.repository.interface';
import { ICart, ICartItem } from './repository/mongo-cart.repository';

@Injectable()
export class CartService {
    constructor(private cart: ICartRepository) {}

    public async getCart(userId: string): Promise<ICart | null> {
        return await this.cart.list(userId);
    }

    public async addToCart(userId: string, item: ICartItem): Promise<ICart> {
        const _existing = await this.cart.list(userId);
        if (!_existing) await this.cart.create(userId);
        return await this.cart.addItem(userId, item);
    }

    public async removeFromCart(
        userId: string,
        item: ICartItem,
    ): Promise<void> {
        await this.cart.removeItem(userId, item);
    }

    public async clearCart(userId: string): Promise<void> {
        await this.cart.clear(userId);
    }
}
