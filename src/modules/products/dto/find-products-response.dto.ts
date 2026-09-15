import { ProductStatus } from '../repository/prisma-products.repository';

export const productStatusMapping = {
    IN_STOCK: 'Em estoque',
    OUT_STOCK: 'Fora de estoque',
    AVAILABLE: 'Disponível',
    UNAVAILABLE: 'Indisponível',
};

class FindProductsResponse {
    id!: string;
    name!: string;
    description!: string;
    price!: number;
    status!: ProductStatus;
    createdAt!: Date;
    updatedAt!: Date | null;
    deletedAt!: Date | null;
    displayStatus!: string;
    slug!: string;
}

export class FindProductsResponseDto {
    data!: FindProductsResponse[];
    pageToken!: string | null;
}
