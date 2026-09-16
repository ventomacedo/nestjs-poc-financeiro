import { ICart, ICartItem } from 'database/mongodb/schemas';

export interface ICartRepository {
    list(userId: string): Promise<ICart | null>;
    create(userId: string): Promise<ICart>;
    addItem(userId, item: ICartItem): Promise<ICart>;
    removeItem(userId, item: ICartItem): Promise<ICart | null>;
    clear(userId: string): Promise<void>;
}
