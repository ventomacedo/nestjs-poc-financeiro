import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let db: { session: { findUnique: jest.Mock } };

    const buildRequest = (token: string) =>
        ({ headers: { authorization: `Bearer ${token}` } }) as never;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        db = { session: { findUnique: jest.fn() } };
        strategy = new JwtStrategy(db as never);
    });

    describe('validate', () => {
        it('returns the userId when the session is FULL_AUTH and not revoked', async () => {
            db.session.findUnique.mockResolvedValue({
                token: 'full-access-token',
                type: 'FULL_AUTH',
                revokedAt: null,
            });

            const result = await strategy.validate(buildRequest('full-access-token'), {
                sub: 'user-id',
            });

            expect(result).toEqual({ userId: 'user-id' });
            expect(db.session.findUnique).toHaveBeenCalledWith({
                where: { token: 'full-access-token' },
            });
        });

        it('throws UnauthorizedException when no session is found for the token', async () => {
            db.session.findUnique.mockResolvedValue(null);

            await expect(
                strategy.validate(buildRequest('unknown-token'), {
                    sub: 'user-id',
                }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException when the session was revoked', async () => {
            db.session.findUnique.mockResolvedValue({
                token: 'full-access-token',
                type: 'FULL_AUTH',
                revokedAt: new Date(),
            });

            await expect(
                strategy.validate(buildRequest('full-access-token'), {
                    sub: 'user-id',
                }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException when the session is not FULL_AUTH', async () => {
            db.session.findUnique.mockResolvedValue({
                token: 'pre-auth-token',
                type: 'PRE_AUTH',
                revokedAt: null,
            });

            await expect(
                strategy.validate(buildRequest('pre-auth-token'), {
                    sub: 'user-id',
                }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
