import { ICartItem } from '../repository/cart.repository.interface';

export class CartResponseDto {
    _id!: string;
    userId!: string;
    items!: ICartItem[];
    status!: 'Active' | 'Inactive';
    createdAt!: Date;
    updatedAt!: Date | null;
    total?: number;
}
