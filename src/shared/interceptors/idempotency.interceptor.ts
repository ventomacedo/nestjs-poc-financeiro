import {
    BadRequestException,
    CallHandler,
    ConflictException,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import {
    catchError,
    concatMap,
    from,
    map,
    of,
    switchMap,
    throwError,
} from 'rxjs';
import { RedisService } from '../redis/redis.service';
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);

    constructor(private redis: RedisService) {}

    public async intercept(contex: ExecutionContext, next: CallHandler) {
        const request = contex.switchToHttp().getRequest();
        const type = request.url.split('/').at(-1);
        const transactionId =
            request.headers['x-transaction-id'] ?? request.body?.transactionId;

        if (!transactionId)
            throw new BadRequestException('transactionId é obrigatório');

        const redisKey = `idemp:${type}@${transactionId}`;
        const lockAcquired = await this.redis.set(redisKey, 'PROCESSING', 30);

        if (!lockAcquired)
            throw new ConflictException(
                'Essa transição já está sendo/foi processada',
            );

        return next.handle().pipe(
            concatMap((data) =>
                from(
                    this.redis.upsert(redisKey, 'DONE', 60 * 60 * 24 * 30),
                ).pipe(
                    catchError((error) => {
                        this.logger.error(
                            `Falha ao marcar ${redisKey} como DONE`,
                            error,
                        );
                        return of(null);
                    }),
                    map(() => data),
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
