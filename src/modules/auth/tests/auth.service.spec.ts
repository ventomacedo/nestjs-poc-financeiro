import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as QRCode from 'qrcode';

import { AuthService } from '../auth.service';

jest.mock('argon2', () => ({
    argon2id: 'argon2id',
    hash: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('@shared/utils', () => ({
    expTimeToDabase: jest.fn((exp: number) => new Date(exp * 1000)),
    encrypt: jest.fn((value: string) => `encrypted(${value})`),
    decrypt: jest.fn((value: string) =>
        typeof value === 'string' ? value.replace(/^encrypted\((.*)\)$/, '$1') : value,
    ),
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn(),
}));

const otpInstance = {
    generateSecret: jest.fn(),
    generateURI: jest.fn(),
    verify: jest.fn(),
};

jest.mock('otplib', () => ({
    OTP: jest.fn().mockImplementation(() => otpInstance),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let db: {
        user: {
            findUnique: jest.Mock;
            findFirst: jest.Mock;
            update: jest.Mock;
        };
        session: {
            create: jest.Mock;
            update: jest.Mock;
        };
    };
    let jwtService: {
        sign: jest.Mock;
        decode: jest.Mock;
    };
    const verifyMock = argon2.verify as jest.Mock;
    const toDataURLMock = QRCode.toDataURL as jest.Mock;

    const user = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        deletedAt: null,
        isFirstAccess: false,
        isTwoFactorEnabled: true,
        twoFactorSecret: 'the-secret',
    };

    beforeEach(() => {
        process.env.PEPPER_SECRET = 'test-pepper';
        verifyMock.mockReset();
        toDataURLMock.mockReset();
        otpInstance.generateSecret.mockReset();
        otpInstance.generateURI.mockReset();
        otpInstance.verify.mockReset();
        db = {
            user: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
            },
            session: {
                create: jest.fn().mockResolvedValue({}),
                update: jest.fn().mockResolvedValue({}),
            },
        };
        jwtService = {
            sign: jest.fn(),
            decode: jest
                .fn()
                .mockReturnValue({ sub: user.id, exp: 1735689600, type: 'FULL_AUTH' }),
        };
        authService = new AuthService(
            db as never,
            jwtService as unknown as JwtService,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it("returns authChallenge MFA_SYNC on the user's first access", async () => {
            db.user.findUnique.mockResolvedValue({
                ...user,
                isFirstAccess: true,
            });
            verifyMock.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('pre-auth-token');

            const result = await authService.login(
                user.email,
                'plain-password',
            );

            expect(result).toEqual({
                authChallenge: 'MFA_SYNC',
                twoFactorAuthToken: 'pre-auth-token',
            });
            expect(verifyMock).toHaveBeenCalledWith(
                user.password,
                `plain-password${process.env.PEPPER_SECRET}`,
            );
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, type: 'PRE_AUTH' },
                { expiresIn: '5m' },
            );
            expect(db.user.findUnique).toHaveBeenCalledWith({
                where: { email: user.email },
            });
        });

        it('returns authChallenge MFA_VALIDATE when the user has already synced 2FA', async () => {
            db.user.findUnique.mockResolvedValue({
                ...user,
                isFirstAccess: false,
            });
            verifyMock.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('pre-auth-token');

            const result = await authService.login(
                user.email,
                'plain-password',
            );

            expect(result).toEqual({
                authChallenge: 'MFA_VALIDATE',
                twoFactorAuthToken: 'pre-auth-token',
            });
        });

        it('throws UnauthorizedException when the user does not exist', async () => {
            db.user.findUnique.mockResolvedValue(null);

            const loginPromise = authService.login(
                'unknown@example.com',
                'plain-password',
            );

            await expect(loginPromise).rejects.toBeInstanceOf(
                UnauthorizedException,
            );
            await expect(loginPromise).rejects.toThrow(
                'Usuário ou senha inválidos.',
            );
            expect(verifyMock).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('throws UnauthorizedException when the password is invalid', async () => {
            db.user.findUnique.mockResolvedValue(user);
            verifyMock.mockResolvedValue(false);

            await expect(
                authService.login(user.email, 'wrong-password'),
            ).rejects.toThrow('Usuário ou senha inválidos.');
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });

    describe('generateTwoFactorSecret', () => {
        it('throws BadRequestException when 2FA is not enabled for the user', async () => {
            db.user.findFirst.mockResolvedValue({
                ...user,
                isTwoFactorEnabled: false,
            });

            await expect(
                authService.generateTwoFactorSecret(user.id),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('generates the secret, updates the user and returns the QR Code', async () => {
            db.user.findFirst.mockResolvedValue(user);
            db.user.update.mockResolvedValue({ ...user, id: user.id });

            otpInstance.generateSecret.mockReturnValue('new-secret');
            otpInstance.generateURI.mockReturnValue(
                'otpauth://totp/App:user@example.com?secret=new-secret',
            );
            toDataURLMock.mockResolvedValue('data:image/png;base64,qrcode');

            const result = await authService.generateTwoFactorSecret(user.id);

            expect(otpInstance.generateURI).toHaveBeenCalledWith({
                issuer: process.env.APP_NAME ?? 'App',
                label: user.email,
                secret: 'new-secret',
            });
            expect(db.user.update).toHaveBeenCalledWith({
                where: { id: user.id },
                data: {
                    twoFactorSecret: 'encrypted(new-secret)',
                    isFirstAccess: false,
                },
            });
            expect(toDataURLMock).toHaveBeenCalledWith(
                'otpauth://totp/App:user@example.com?secret=new-secret',
            );
            expect(result).toEqual({
                secret: 'new-secret',
                qrCodeDataURL: 'data:image/png;base64,qrcode',
            });
        });

        it('throws NotFoundException when no record is updated', async () => {
            db.user.findFirst.mockResolvedValue(user);
            db.user.update.mockResolvedValue({ id: undefined });

            otpInstance.generateSecret.mockReturnValue('new-secret');
            otpInstance.generateURI.mockReturnValue('otpauth://totp/x');

            await expect(
                authService.generateTwoFactorSecret(user.id),
            ).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('validateTwoFactorAuth', () => {
        it('throws BadRequestException when 2FA is not enabled or has no secret', async () => {
            db.user.findFirst.mockResolvedValue({
                ...user,
                twoFactorSecret: null,
            });

            await expect(
                authService.validateTwoFactorAuth(user.id, '123456'),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('throws UnauthorizedException when the TOTP code is invalid', async () => {
            db.user.findFirst.mockResolvedValue(user);
            otpInstance.verify.mockResolvedValue({ valid: false });

            await expect(
                authService.validateTwoFactorAuth(user.id, '000000'),
            ).rejects.toThrow('Código de authenticação inválido');
        });

        it('returns the accessToken when the TOTP code is valid', async () => {
            db.user.findFirst.mockResolvedValue(user);
            otpInstance.verify.mockResolvedValue({ valid: true });
            jwtService.sign.mockReturnValue('full-access-token');

            const result = await authService.validateTwoFactorAuth(
                user.id,
                '123456',
            );

            expect(otpInstance.verify).toHaveBeenCalledWith({
                token: '123456',
                secret: user.twoFactorSecret,
            });
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, type: 'FULL_AUTH' },
                { expiresIn: '8h' },
            );
            expect(result).toEqual({ accessToken: 'full-access-token' });
        });
    });
});
