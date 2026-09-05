import { PrismaService } from '@database';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { isAfter } from '@shared/utils';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-full-auth') {
    constructor(private db: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
            passReqToCallback: true,
        });
    }

    public async validate(req: Request, payload: any) {
        const token = req.headers.authorization?.split(' ').at(-1);
        const session = await this.db.session.findUnique({
            where: { token },
        });

        if (!!session?.revokedAt || !session?.token)
            throw new UnauthorizedException(
                'Acesso negado. Token de acesso inválido.',
            );

        if (session?.type !== 'FULL_AUTH')
            throw new UnauthorizedException(
                'Acesso negado. Autenticação de dois fatores pendente.',
            );

        return { userId: payload.sub };
    }
}
