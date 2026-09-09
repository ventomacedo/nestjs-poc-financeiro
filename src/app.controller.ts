import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get('/health')
    public health(_, res) {
        return res.status(200).json({ status: 'ok' });
    }
}
