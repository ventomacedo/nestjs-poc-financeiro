import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CheckoutItemDto {
    @IsNotEmpty({ message: 'productId é obrigatório' })
    @ApiProperty({
        example: 'uuid-v7-do-produto-112233',
        description: 'Id UUIDv7 do produto (coleção `products` no MongoDB)',
    })
    productId!: string;

    @IsNotEmpty({ message: 'name é obrigatório' })
    @IsString()
    @ApiProperty({ description: 'Nome do produto, snapshot do catálogo' })
    name!: string;

    @IsNotEmpty({ message: 'quantity é obrigatório' })
    @IsNumber()
    @Min(1)
    @ApiProperty({ description: 'Quantidade do produto no pedido' })
    quantity!: number;

    @IsNotEmpty({ message: 'price é obrigatório' })
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: '12388',
        description: 'Preço unitário em centavos, snapshot do catálogo',
    })
    price!: number;
}
