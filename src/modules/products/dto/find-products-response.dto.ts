import { ProductStatus } from '../repository/mongo-products.repository';

class FindProductsResponse {
    id!: string;
    name!: string;
    slug!: string;
    description!: string;
    price!: number;
    status!: ProductStatus;
    createdAt!: Date;
    updatedAt!: Date | null;
    displayStatus!: string;
}

export class FindProductsResponseDto {
    data!: FindProductsResponse[];
    pageToken!: string | null;
}
