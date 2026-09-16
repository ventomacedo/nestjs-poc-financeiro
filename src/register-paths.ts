import { register } from 'tsconfig-paths';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Module from 'node:module';

const { compilerOptions } = JSON.parse(
    readFileSync(join(__dirname, '../tsconfig.json'), 'utf-8'),
);

register({
    baseUrl: __dirname,
    paths: compilerOptions.paths,
});

// Prisma gera código com imports relativos terminando em ".js" (convenção
// nodenext), mas em dev rodamos ".ts" direto via ts-node, sem esses ".js"
// existirem. Fallback: se resolução original falhar num request ".js",
// tenta de novo trocando pra ".ts".
const originalResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
    request: string,
    ...rest: unknown[]
) {
    try {
        return originalResolveFilename.call(this, request, ...rest);
    } catch (error) {
        if (request.endsWith('.js')) {
            const tsRequest = request.replace(/\.js$/, '.ts');
            return originalResolveFilename.call(this, tsRequest, ...rest);
        }
        throw error;
    }
};
