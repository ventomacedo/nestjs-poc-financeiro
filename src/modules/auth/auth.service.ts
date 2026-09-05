import * as bcrypt from 'bcrypt';

import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as QRCode from 'qrcode';
import { OTP } from 'otplib';

import { LoginResponseDto } from './dto/login-response.dto';
import { TwoFactorAuthSyncResponse } from './dto/two-factor-auth-sync-response.dto';
import { TwoFactorAuthResponse } from './dto/two-factor-auth-response.dto';
import { PrismaService } from '@database';
import type { User } from '@prisma';
import { expTimeToDabase } from '@shared/utils';

@Injectable()
export class AuthService {
    private readonly otp: OTP;

    constructor(
        private db: PrismaService,
        private jwtService: JwtService,
    ) {
        this.otp = new OTP({ strategy: 'totp' });
    }

    public async login(
        _email: string,
        _password: string,
    ): Promise<LoginResponseDto> {
        try {
            const INVALID_MESSAGE = 'Usuário ou senha inválidos.';
            const user = await this.db.user.findUnique({
                where: { email: _email },
            });

            if (!user) throw new UnauthorizedException(INVALID_MESSAGE);

            const passwordIsValid = await bcrypt.compare(
                _password,
                user.password,
            );
            if (!passwordIsValid)
                throw new UnauthorizedException(INVALID_MESSAGE);

            return {
                authChallenge: user.isFirstAccess ? 'MFA_SYNC' : 'MFA_VALIDATE',
                twoFactorAuthToken: await this.generaeTwoFactorAuthToken(
                    user.id,
                ),
            };
        } catch (error) {
            throw error;
        }
    }

    public async logout(session: string) {
        try {
            const [_, token] = session?.split(' ');
            return await this.remokeSession(token);
        } catch (error) {
            throw new NotFoundException('Sessão não encontrada.');
        }
    }

    public async generateTwoFactorSecret(
        userId: string,
    ): Promise<TwoFactorAuthSyncResponse> {
        const user = await this.findUserById(userId);

        if (!user?.isTwoFactorEnabled)
            throw new BadRequestException(
                'O 2FA não está ativado para este usuário.',
            );

        const secret = this.otp.generateSecret();
        const appName = process.env.APP_NAME ?? 'App';

        const otpAuthURL = this.otp.generateURI({
            issuer: appName,
            label: user.email,
            secret,
        });
        await this.updateUserSecret(user.id, secret);
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL);

        return {
            secret,
            qrCodeDataURL,
        };
    }

    public async validateTwoFactorAuth(
        userId: string,
        code: string,
    ): Promise<TwoFactorAuthResponse> {
        const user = await this.findUserById(userId);

        if (!user?.isTwoFactorEnabled || !user?.twoFactorSecret)
            throw new BadRequestException(
                'O 2FA não está ativado para este usuário.',
            );

        const { valid } = await this.otp.verify({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (!valid)
            throw new UnauthorizedException('Código de authenticação inválido');

        const accessToken = await this.generateAuthToken(user.id);
        await this.persistSe2ssion(accessToken);
        return { accessToken };
    }

    private async updateUserSecret(
        userId: string,
        secret: string,
    ): Promise<void> {
        try {
            const result = await this.db.user.update({
                where: { id: userId },
                data: { twoFactorSecret: secret, isFirstAccess: false },
            });

            if (!result.id)
                throw new NotFoundException(
                    `Nenhum registro encontrado com o ID ${userId} ou nada foi alterado.`,
                );
        } catch (error) {
            throw error;
        }
    }

    private async findUserById(userId: string): Promise<User> {
        try {
            const userData = await this.db.user.findFirst({
                where: { id: userId },
            });
            return userData as User;
        } catch (error) {
            console.error(error);
            return {} as User;
        }
    }

    private async generaeTwoFactorAuthToken(userId: string) {
        return this.jwtService.sign(
            { sub: userId, type: 'PRE_AUTH' },
            { expiresIn: '5m' },
        );
    }

    private async generateAuthToken(userId: string) {
        return this.jwtService.sign(
            { sub: userId, type: 'FULL_AUTH' },
            { expiresIn: '8h' },
        );
    }

    private async persistSe2ssion(session: string) {
        const { sub, exp, type } = this.jwtService.decode(session);
        await this.db.session.create({
            data: {
                userId: sub,
                token: session,
                type: type,
                expiresAt: expTimeToDabase(exp),
            },
        });
    }

    private async remokeSession(session: string) {
        await this.db.session.update({
            where: { token: session },
            data: { revokedAt: new Date() },
        });
    }
}
