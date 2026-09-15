import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchProductsRequestDto {
    @IsString({ message: 'terms precisa ser uma string' })
    @IsNotEmpty({ message: 'terms é obrigatório.' })
    @Transform(({ value }) => value?.trim().replace(/<[^]*>/g, ''))
    @ApiProperty({
        example: 'Super Nintendo',
        description: 'Qualquer termo que você precise buscar.',
    })
    terms!: string;

    @IsOptional()
    @ApiProperty({
        example: 'MDFhMGE1OWYtNWIyNC03ZGUxLTg1MzItMDBlMzExZDIyYjJh',
        description: 'Token de paginação vinda da página anterior',
    })
    pageToken!: string;

    @IsOptional()
    @ApiProperty({
        example: 10,
        description: 'Quantidade de registros por página.',
    })
    pageSize!: number;
}
