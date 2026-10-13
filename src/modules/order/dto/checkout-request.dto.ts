import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';

import { CheckoutItemDto } from './checkout-item.dto';

export class CheckoutRequestDto {
    @ApiProperty({
        example: '3000',
        description:
            'Total do pedido em centavos, calculado no carrinho (módulo `cart`) — order não consulta o Mongo, então o total vem pronto do cliente.',
    })
    @IsNumber({}, { message: 'total deve ser um número válido' })
    @Min(0, { message: 'total não pode ser menor que zero' })
    total!: number;

    @ApiProperty({
        type: [CheckoutItemDto],
        description:
            'Snapshot dos itens do carrinho (id do produto, nome, quantidade e preço) — order não consulta o catálogo (MongoDB), então esse snapshot é a fonte da verdade do pedido.',
    })
    @ArrayNotEmpty({ message: 'items não pode ser vazio' })
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items!: CheckoutItemDto[];
}
