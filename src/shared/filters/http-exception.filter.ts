import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse();
        const status =
            exception instanceof HttpException ? exception.getStatus() : 500;
        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Erro interno.';

        if (!(exception instanceof HttpException)) {
            this.logger.error(
                exception instanceof Error ? exception.message : exception,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        res.status(status).json({ statusCode: status, message });
    }
}
