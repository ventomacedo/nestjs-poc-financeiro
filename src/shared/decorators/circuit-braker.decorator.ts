import { Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface CircuitBrakerOptions extends CircuitBreaker.Options {
    fallback?: string;
}

const breakerRegistry = new Map<string, CircuitBreaker>();

export function UseCircuitBrake(options: CircuitBrakerOptions = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) => {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const registryKey = `${className}.${propertyKey}`;
        const logger = new Logger(`CircuitBraker: ${registryKey}`);

        descriptor.value = async function (this: any, ...args: any[]) {
            if (!breakerRegistry.has(registryKey)) {
                const defaultOptions: CircuitBreaker.Options = {
                    timeout: 5000, // 5s
                    errorThresholdPercentage: 50, // 50%
                    resetTimeout: 10000, // 10s
                    ...options,
                };

                const breaker = new CircuitBreaker(
                    (self: any, ..._args: any[]) =>
                        originalMethod.apply(self, _args),
                    defaultOptions,
                );

                if (options.fallback) {
                    breaker.fallback((self: any, ...fbArgs: any[]) =>
                        self[options.fallback!](...fbArgs),
                    );
                }

                breaker.on('open', () =>
                    logger.error(
                        `🔴 DISJUNTOR ABERTO! Bloqueando chamadas para ${registryKey}`,
                    ),
                );
                breaker.on('halfOpen', () =>
                    logger.error(
                        `🟡 DISJUNTOR MEIO-ABERTO! Testando recuperação de ${registryKey}`,
                    ),
                );
                breaker.on('close', () =>
                    logger.error(
                        `🟢 DISJUNTOR FECHADO! Serviço ${registryKey} normalizado.`,
                    ),
                );

                breakerRegistry.set(registryKey, breaker);
            }

            const breaker = breakerRegistry.get(registryKey);
            return breaker?.fire(this, ...args);
        };

        return descriptor;
    };
}
