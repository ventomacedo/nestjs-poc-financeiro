import { ProductStatus } from '../repository/mongo-products.repository';

export const productStatusMapping = {
    IN_STOCK: 'Em estoque',
    OUT_STOCK: 'Fora de estoque',
    AVAILABLE: 'Disponível',
    UNAVAILABLE: 'Indisponível',
};

class SearchProductsResponse {
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

export class SearchProductsResponseDto {
    data!: SearchProductsResponse[];
    pageToken!: string | null;
}
