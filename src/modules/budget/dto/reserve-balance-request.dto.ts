import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class ReserveBalanceRequestDto {
    @ApiProperty({
        example: 'uuid-v7-gerado-no-front-112233',
        description:
            'UUIDv7 gerado pelo frontend para assegurar que a transação é rastreável',
    })
    @IsNotEmpty({ message: 'transactionId é obrigatório ' })
    transactionId!: string;

    @ApiProperty({
        example: '1500000',
        description:
            'Valor inteiro, já que reservamos os dois últimos dígitos para os centavos',
    })
    @IsPositive({ message: 'amount deve ser um número positivo' })
    @IsNotEmpty({ message: 'amount é obrigatório' })
    @IsNumber({}, { message: 'amount deve ser um número válido' })
    @Min(0, { message: 'amount não pode ser menor que zero' })
    amount!: number;

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
