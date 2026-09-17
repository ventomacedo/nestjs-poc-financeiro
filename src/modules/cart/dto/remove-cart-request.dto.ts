import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@Injectable()
export class RemoveFromCartRequestDto {
    @IsNotEmpty()
    @ApiProperty({
        example: 'uuid-v7-do-produto-112233',
        description: 'Id UUIDv7 do produto',
    })
    productId!: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Valor inteiro da quantidade' })
    quantity!: number;
}
