import { Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface BulkheadOptions extends CircuitBreaker.Options {
    capacity: number;
    fallback?: string;
}

const bulkheadRegistry = new Map<string, CircuitBreaker>();

export function UseBulkhead(options: BulkheadOptions) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const registryKey = `${className}.${propertyKey}`;
        const logger = new Logger(`Bulkhead: ${registryKey}`);

        descriptor.value = async function (...args: any[]) {
            if (!bulkheadRegistry.has(registryKey)) {
                const breakerOptions: CircuitBreaker.Options = {
                    ...options,
                    timeout: options.timeout ?? false,
                };

                const breaker = new CircuitBreaker(
                    (self: any, ..._args: any[]) =>
                        originalMethod.apply(self, _args),
                    breakerOptions,
                );

                if (options.fallback) {
                    breaker.fallback((self: any, ..._args: any[]) =>
                        self[options.fallback!](..._args),
                    );
                }

                const WARN_MESSAGE = `⚠️ BULKHEAD CHEIO! Requisição para ${registryKey} foi rejeitada e desviada para o Fallback.`;
                breaker.on('semaphoreLocked', () => logger.warn(WARN_MESSAGE));
                breaker.on('open', () => logger.warn(WARN_MESSAGE));

                bulkheadRegistry.set(registryKey, breaker);
            }

            const breaker = bulkheadRegistry.get(registryKey);
            return breaker!.fire(this, ...args);
        };

        return descriptor;
    };
}
