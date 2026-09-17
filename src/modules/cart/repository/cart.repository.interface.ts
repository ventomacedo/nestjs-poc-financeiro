import {
    ICartItem as CartItemInterface,
    ICart as CartInterface,
} from 'database/mongodb/schemas';
import { RemoveFromCartRequestDto } from '../dto/remove-cart-request.dto';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export type ICart = CartInterface;
export type ICartItem = CartItemInterface;
export interface ICartRepository {
    list(userId: string): Promise<ICart | null>;
    create(userId: string): Promise<ICart>;
    addItem(userId, item: ICartItem): Promise<ICart>;
    removeItem(userId, item: RemoveFromCartRequestDto): Promise<ICart | null>;
    clear(userId: string): Promise<void>;
}
