import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FindPostsRequestDto {
    @IsString({ message: 'paginationToken precisa ser uma string' })
    @IsOptional()
    @ApiProperty({
        example: 'MDFhMGE1OWYtNWIyNC03ZGUxLTg1MzItMDBlMzExZDIyYjJh',
        description: 'Token de paginação vinda da página anterior',
    })
    pageToken!: string;

    @Type(() => Number)
    @IsInt({ message: 'pageSize precisa ser um inteiro.' })
    @IsOptional()
    @ApiProperty({
        example: 10,
        description: 'Quantidade máxima de registros que a página poderá ter.',
    })
    pageSize!: number;
}
