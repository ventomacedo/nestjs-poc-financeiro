import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DoneRequestDto {
    @ApiProperty({ example: 'BUY-ORDER-0001', description: 'ID do pedido' })
    @IsNotEmpty({ message: 'orderId é obrigatório' })
    orderId!: string;

    @ApiProperty({
        example: 1,
        description: 'Versão do saldo disponível no endpoint /balance',
    })
    @IsNotEmpty({ message: 'version é obrigatório' })
    version!: number;
}
