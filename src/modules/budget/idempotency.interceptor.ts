import {
    BadRequestException,
    CallHandler,
    ConflictException,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { catchError, from, switchMap, tap, throwError } from 'rxjs';
import { RedisService } from '../../shared/redis/redis.service';
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    constructor(private redis: RedisService) {}

    public async intercept(contex: ExecutionContext, next: CallHandler) {
        const request = contex.switchToHttp().getRequest();
        const type = request.url.split('/').at(-1);
        const { transactionId } = request.body;

        if (!transactionId)
            throw new BadRequestException('transactionId é obrigatório');

        const redisKey = `idemp:${type}@${transactionId}`;
        const lockAcquired = await this.redis.set(redisKey, 'PROCESSING', 30);

        if (!lockAcquired)
            throw new ConflictException(
                'Essa transição já está sendo/foi processada',
            );

        return next.handle().pipe(
            tap(
                async () =>
                    await this.redis.upsert(
                        redisKey,
                        'DONE',
                        60 * 60 * 24 * 30,
                    ),
            ),
            catchError((error) =>
                from(this.redis.del(redisKey)).pipe(
                    switchMap(() => throwError(() => error)),
                ),
            ),
        );
    }
}
