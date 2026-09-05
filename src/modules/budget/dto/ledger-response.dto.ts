import { LedgerType } from '@prisma';
import { Transform } from 'class-transformer';

const typeMapping = {
    CREDITED: 'Creditado',
    WITHDRAW: 'Sacado',
    RESERVED: 'Reservado',
    REFUNDED: 'Estornado',
};

export class LedgerResponseDto {
    id!: string;
    userId!: string;
    type!: LedgerType;
    orderId!: string;
    reserveId!: string;
    amount!: number;
    timestamp!: Date | null;

    @Transform(({ obj }) => typeMapping[obj.type] || obj.type)
    displayType!: string;

    constructor(partial: Partial<LedgerResponseDto>) {
        Object.assign(this, partial);
    }
}
