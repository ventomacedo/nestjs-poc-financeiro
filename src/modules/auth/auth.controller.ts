import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    Headers,
    Get,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SigninRequestDto } from './dto/signin-request.dto';
import { TwoFactorAuthResponse } from './dto/two-factor-auth-response.dto';
import { TwoFactorAuthRequest } from './dto/two-factor-auth-request.dto';
import { TwoFactorAuthSyncResponse } from './dto/two-factor-auth-sync-response.dto';
import { twoFactorAuthGuard } from './guards/two-factor-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwthGuard } from './guards/jwt.guard';

type PreAuthRequest = Request & { user: { userId: string } };

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Faz o login na plataforma' })
    @Post('signin')
    public async signin(
        @Body() body: SigninRequestDto,
    ): Promise<LoginResponseDto> {
        return await this.authService.login(body.email, body.password);
    }

    @UseGuards(JwthGuard)
    @ApiOperation({ summary: 'Faz o logout na plataforma' })
    @Get('signout')
    public async signOut(
        @Headers('authorization') authorization: string,
    ): Promise<any> {
        return await this.authService.logout(authorization);
    }

    @UseGuards(twoFactorAuthGuard)
    @Post('verify-two-factor-authentication')
    async verifyTwoFactorAuthentication(
        @Req() req: PreAuthRequest,
        @Body() body: TwoFactorAuthRequest,
    ): Promise<TwoFactorAuthResponse> {
        return await this.authService.validateTwoFactorAuth(
            req.user.userId,
            body.code,
        );
    }

    @UseGuards(twoFactorAuthGuard)
    @Post('sync-app-authenticator')
    syncAppAuthenticator(
        @Req() req: PreAuthRequest,
    ): Promise<TwoFactorAuthSyncResponse> {
        return this.authService.generateTwoFactorSecret(req.user.userId);
    }
}
