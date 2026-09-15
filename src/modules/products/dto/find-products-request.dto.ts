import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FindProductsRequestDto {
    @IsString({ message: 'paginationToken precisa ser uma string' })
    @IsOptional()
    @ApiProperty({
        example: 'MDFhMGE1OWYtNWIyNC03ZGUxLTg1MzItMDBlMzExZDIyYjJh',
        description: 'Token de paginação vinda da página anterior',
    })
    pageToken!: string;

    @IsInt({ message: 'pageSize precisa ser um inteiro.' })
    @IsOptional()
    @ApiProperty({
        example: 10,
        description: 'Quantidade máxima de registros que a página poderá ter.',
    })
    pageSize!: number;
}
