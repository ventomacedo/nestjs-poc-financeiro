import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsTaxId } from '@shared/decorators';

export class UpdateBankRequestDto {
    @ApiProperty({
        example: 'GXHTTL9C000198',
        description: 'CNPJ (alfanumérico)',
    })
    @IsNotEmpty({ message: 'taxId é obrigatório.' })
    @IsTaxId({ message: 'Informe um CNPJ válido.' })
    taxId!: string;

    @ApiProperty({
        example: 'Monopoly Bank',
        description: 'Razão Social da instituição',
    })
    @IsNotEmpty({ message: 'Name é obrigatório.' })
    name!: string;

    @ApiProperty({
        example: 'Banco imobiliário',
        description: 'Nome Fantasia da instituição',
    })
    @IsNotEmpty({ message: 'fantasyName é obrigatório.' })
    fantasyName!: string;

    @ApiProperty({
        example: '001',
        description: 'Identificador do Sistema de Pagamneto Brasileiro',
    })
    @IsOptional()
    ispb!: string;

    @ApiProperty({
        example: '00000001',
        description:
            'Código do Sistema de Compensação de Cheques e Outros Papeis',
    })
    @IsNotEmpty({ message: 'compeCode é obrigatório.' })
    compeCode!: string;
}
