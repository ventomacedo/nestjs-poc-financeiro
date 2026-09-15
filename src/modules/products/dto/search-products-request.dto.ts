import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchProductsRequestDto {
    @IsString({ message: 'terms precisa ser uma string' })
    @IsNotEmpty({ message: 'terms é obrigatório.' })
    @Transform(({ value }) => value?.trim().replace(/<[^]*>/g, ''))
    @ApiProperty({
        example: 'Super Nintendo',
        description: 'Qualquer termo que você precise buscar.',
    })
    terms!: string;
}
