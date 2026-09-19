import { IsTaxIdConstraint } from './is-tax-id.decorator';

describe('IsTaxIdConstraint', () => {
    let constraint: IsTaxIdConstraint;

    beforeEach(() => {
        constraint = new IsTaxIdConstraint();
    });

    describe('validate', () => {
        it('accepts a valid numeric CNPJ', () => {
            expect(constraint.validate('11222333000181', {} as never)).toBe(
                true,
            );
        });

        it('accepts a valid formatted numeric CNPJ', () => {
            expect(constraint.validate('11.222.333/0001-81', {} as never)).toBe(
                true,
            );
        });

        it('accepts a valid alphanumeric CNPJ', () => {
            expect(constraint.validate('AB123456BBBB42', {} as never)).toBe(
                true,
            );
        });

        it('rejects when the value is not a string', () => {
            expect(
                constraint.validate(11222333000181 as never, {} as never),
            ).toBe(false);
        });

        it('rejects when the length is invalid', () => {
            expect(constraint.validate('1122233300018', {} as never)).toBe(
                false,
            );
        });

        it('rejects when all characters are the same', () => {
            expect(constraint.validate('11111111111111', {} as never)).toBe(
                false,
            );
        });

        it('rejects when the first check digit is incorrect', () => {
            expect(constraint.validate('11222333000191', {} as never)).toBe(
                false,
            );
        });

        it('rejects when the second check digit is incorrect', () => {
            expect(constraint.validate('11222333000180', {} as never)).toBe(
                false,
            );
        });
    });

    describe('defaultMessage', () => {
        it('returns the default invalid CNPJ message', () => {
            expect(constraint.defaultMessage({} as never)).toBe(
                'CNPJ inválido (aceita formato numérico tradicional ou alfanumérico).',
            );
        });
    });
});
