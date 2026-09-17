import { Inject, Injectable } from '@nestjs/common';
import {
    type ICartRepository,
    type ICart,
    type ICartItem,
    CART_REPOSITORY,
} from './repository/cart.repository.interface';
import { RemoveFromCartRequestDto } from './dto/remove-cart-request.dto';
import { CartResponseDto } from './dto/cart.response.dto';

@Injectable()
export class CartService {
    constructor(@Inject(CART_REPOSITORY) private cart: ICartRepository) {}

    public async getCart(userId: string): Promise<CartResponseDto | null> {
        const _cart = await this.cart.list(userId);
        return !!_cart ? this._calculateCart(_cart) : null;
    }

    public async addToCart(
        userId: string,
        item: ICartItem,
    ): Promise<CartResponseDto | null> {
        const _existing = await this.cart.list(userId);
        if (!_existing) await this.cart.create(userId);

        await this.cart.addItem(userId, item);
        const _cart = await this.cart.list(userId);

        return _cart ? this.getCart(userId) : null;
    }

    public async removeFromCart(
        userId: string,
        item: RemoveFromCartRequestDto,
    ): Promise<CartResponseDto | null> {
        const _cart = await this.cart.removeItem(userId, item);
        return !!_cart ? this.getCart(userId) : null;
    }

    public async clearCart(userId: string): Promise<CartResponseDto | null> {
        await this.cart.clear(userId);
        return await this.getCart(userId);
    }

    private async _calculateCart(cart: ICart): Promise<CartResponseDto> {
        const items = (cart.items ?? []).reduce<ICartItem[]>((acc, item) => {
            const existing = acc.find((i) => i.productId === item.productId);

            if (existing) {
                existing.quantity += item.quantity;
            } else {
                acc.push({ ...item });
            }

            return acc;
        }, []);

        const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        return {
            ...cart,
            _id: cart._id.toString(),
            updatedAt: cart.updatedAt ?? null,
            items,
            total,
        };
    }
}
