import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { JwthGuard } from '@auth';
import { BanksService } from './banks.service';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBanksResponseDto } from './dto/update-bank-response.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) {}

    @SkipThrottle()
    @Get('/test-ciruit-breaker')
    async testCircuitBraker() {
        return this.banksService.testCircuitBraker();
    }

    @SkipThrottle()
    @Get('/test-bulkhead')
    async testBulkhead() {
        return this.banksService.testBulkhead();
    }

    @Get('/')
    @UseGuards(JwthGuard)
    async getBanks(): Promise<any> {
        return await this.banksService.getBanks();
    }

    @Get(`/:id`)
    @UseGuards(JwthGuard)
    async findBanksById(@Param('id') id: string): Promise<any> {
        return await this.banksService.findBankById(id);
    }

    @Post('/')
    @UseGuards(JwthGuard)
    async createBanks(
        @Body() body: CreateBankRequestDto,
    ): Promise<CreateBanksResponseDto> {
        return this.banksService.createBank(body);
    }

    @Put('/:id')
    @UseGuards(JwthGuard)
    async updateBanks(
        @Param('id') id: string,
        @Body() body: CreateBankRequestDto,
    ): Promise<UpdateBanksResponseDto> {
        return this.banksService.updateBank(body, id);
    }

    @Delete('/:id')
    @UseGuards(JwthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async deleteBanks(@Param('id') id: string): Promise<void> {
        return this.banksService.deleteBank(id);
    }
}
