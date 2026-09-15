import { Injectable } from '@nestjs/common';
import type { ProductStatus } from '../repository/prisma-products.repository';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class CreateProductsRequestDto {
    @IsNotEmpty({ message: 'name é um campo obrigatório.' })
    @ApiProperty({ description: 'Nome do produto que será usado para o slug' })
    name!: string;

    @IsOptional()
    @ApiProperty({ description: 'Descrição do produto. Ideal para SEO' })
    description!: string;

    @IsNotEmpty({ message: 'price é um campo obrigatório.' })
    @ApiProperty({
        example: '12388',
        description: 'Preço do produto em centavos (ex.: 12388 / 100 = 123,88)',
    })
    price!: number;

    @IsNotEmpty({ message: 'status é um campo obrigatório.' })
    @ApiProperty({
        description:
            'Status possíveis "IN_STOCK" | "OUT_STOCK" | "AVAILABLE" | "UNAVAILABLE"',
    })
    status!: ProductStatus;

    @IsOptional()
    @ApiProperty({
        description: 'slug do produto',
    })
    slug!: string;
}
