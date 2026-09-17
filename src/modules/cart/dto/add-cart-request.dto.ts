import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@Injectable()
export class AddToCartRequestDto {
    @IsNotEmpty()
    @ApiProperty({
        example: 'uuid-v7-do-produto-112233',
        description: 'Id UUIDv7 do produto',
    })
    productId!: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Valor inteiro da quantidade' })
    quantity!: number;

    @IsNotEmpty({ message: 'price é um campo obrigatório.' })
    @ApiProperty({
        example: '12388',
        description: 'Preço do produto em centavos (ex.: 12388 / 100 = 123,88)',
    })
    price!: number;
}
